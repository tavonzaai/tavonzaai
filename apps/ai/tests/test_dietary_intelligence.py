"""
Tests for Dietary, Allergen, and Sommelier Intelligence:
1. get_menu category filtering.
2. get_menu dietary preference filtering (keto, vegan, vegetarian).
3. get_menu allergen exclusion (strict filtering of gluten, dairy, etc.).
4. get_menu price ceiling filtering.
5. End-to-end tool calling with dietary arguments.
"""
import os
import sys

import pytest

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
from src.internal_client import InternalClient
from src.models import ActorContext
from src.tools.definitions.restaurant_tools import TOOLS
from src.tools.executor.executor import ToolExecutor


@pytest.fixture
def client():
    return InternalClient()


@pytest.fixture
def guest_actor():
    return ActorContext(
        actor_type="USER",
        organization_id="org_test",
        restaurant_id="rest_test",
        branch_id="branch_test",
        permissions=["menu.read"],
        resource_scope={"table_code": "T3"},
    )


class TestDietaryIntelligence:
    def test_get_menu_schema_has_dietary_and_allergen_properties(self):
        """Tool definition must expose category, dietary_preference, exclude_allergens, and max_price."""
        schema = TOOLS["get_menu"]["schema"]["function"]["parameters"]["properties"]
        assert "category" in schema
        assert "dietary_preference" in schema
        assert "exclude_allergens" in schema
        assert "max_price" in schema

    @pytest.mark.asyncio
    async def test_get_menu_filters_by_category(self, client, guest_actor):
        """get_menu with category='Mains' returns only main dishes."""
        executor = ToolExecutor(client)
        result = await executor.execute("get_menu", {"category": "Mains"}, guest_actor)

        assert result["ok"] is True
        items = result["data"]["items"]
        assert len(items) > 0
        assert all(item["category"] == "Mains" for item in items)
        await client.aclose()

    @pytest.mark.asyncio
    async def test_get_menu_filters_by_keto_diet(self, client, guest_actor):
        """get_menu with dietary_preference='keto' returns only keto-compliant dishes."""
        executor = ToolExecutor(client)
        result = await executor.execute("get_menu", {"dietary_preference": "keto"}, guest_actor)

        assert result["ok"] is True
        items = result["data"]["items"]
        assert len(items) >= 2
        for item in items:
            assert "keto" in item["dietary"]
        item_names = [it["name"] for it in items]
        assert "Pan-Seared Line-Caught Seabass" in item_names
        assert "Grilled Prime Ribeye (300g)" in item_names
        # Wagyu smash contains brioche (not keto)
        assert "Classic Wagyu Smash" not in item_names
        await client.aclose()

    @pytest.mark.asyncio
    async def test_get_menu_strict_allergen_exclusion(self, client, guest_actor):
        """get_menu excluding gluten must NOT return dishes containing gluten."""
        executor = ToolExecutor(client)
        result = await executor.execute(
            "get_menu",
            {"exclude_allergens": ["gluten"]},
            guest_actor,
        )

        assert result["ok"] is True
        items = result["data"]["items"]
        assert len(items) > 0
        for item in items:
            assert "gluten" not in item.get("allergens", [])

        item_names = [it["name"] for it in items]
        # Must not contain burger (brioche) or beer (malt gluten)
        assert "Classic Wagyu Smash" not in item_names
        assert "Citrus Botanical Craft IPA" not in item_names
        # Must contain gluten-free items
        assert "Pan-Seared Line-Caught Seabass" in item_names
        await client.aclose()

    @pytest.mark.asyncio
    async def test_get_menu_price_ceiling(self, client, guest_actor):
        """get_menu with max_price=15.0 returns only items <= $15.00."""
        executor = ToolExecutor(client)
        result = await executor.execute("get_menu", {"max_price": 15.0}, guest_actor)

        assert result["ok"] is True
        items = result["data"]["items"]
        assert len(items) > 0
        for item in items:
            assert item["price"] <= 15.0
        await client.aclose()

    @pytest.mark.asyncio
    async def test_get_menu_includes_sommelier_pairings(self, client, guest_actor):
        """Main courses should include recommended drink/wine pairings."""
        executor = ToolExecutor(client)
        result = await executor.execute("get_menu", {"category": "Mains"}, guest_actor)

        items = result["data"]["items"]
        steak = next((it for it in items if "Ribeye" in it["name"]), None)
        assert steak is not None
        assert "pairing" in steak
        assert "Chianti" in steak["pairing"]
        await client.aclose()
