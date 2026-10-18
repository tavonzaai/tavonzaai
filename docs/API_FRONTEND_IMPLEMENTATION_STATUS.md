# Tavonza AI — Backend API & Frontend Implementation Status Matrix

> **Authoritative Tracking Document**  
> Comprehensive full-project audit of all backend REST & RPC endpoints, WebSocket events, and internal gateways across `apps/api` and `apps/ai`, paired with their exact implementation and integration status across all 6 frontend applications:
> - `@frontend/customer` (Customer Mobile & Desktop Web App)
> - `@frontend/waiter` (Waiter POS & Floor Terminal)
> - `@frontend/kitchen` (Kitchen Display System — KDS)
> - `@frontend/cashier` (Cashier POS & Offline Settle Terminal)
> - `@frontend/manager` (Branch Manager Operations Portal)
> - `@frontend/admin` (Platform Multi-Tenant Admin Console)

---

## 📊 Executive Summary

| Category | Count | Status Notes |
| :--- | :---: | :--- |
| **Total Backend Controllers Audited** | **28 Controller & Gateway Classes** | 27 NestJS controllers (across 24 files in `apps/api`) + 1 WebSocket Gateway |
| **Total Backend REST Endpoints Audited** | **204 Endpoints** | 199 NestJS public/staff REST routes + 5 `/internal/*` AI Gateway routes |
| **Python AI Microservice Endpoints** | **7 Endpoints** | FastAPI service (`apps/ai/src/main.py`) consumed via Tool Gateway & chat clients |
| **Total System HTTP Endpoints** | **211 Endpoints** | 204 NestJS routes + 7 Python FastAPI routes |
| **Frontend Implemented Endpoints** | **181 Endpoints (`[x]`)** | Fully wired in Redux API slices and frontend UI views across all 6 apps |
| **Pending Frontend Endpoints (Faka / Empty)** | **30 Endpoints (`[ ]`)** | Backend complete & verified; pending frontend UI/Redux wiring |
| **Realtime WebSocket Channels & Broadcasts** | **9 Broadcast Topics** | Socket.IO Gateway (`apps/api/src/modules/realtime/realtime.gateway.ts`) |

### Legend
- `[x]` **Done** — Endpoint exists in backend and is actively integrated into frontend Redux features, hooks, and UI components.
- `[ ]` **Empty (Faka / Pending)** — Backend endpoint is complete and available, but frontend has not yet integrated or wired this endpoint to the UI.

---

## 1. Identity & Access Domain

### 1.1 Authentication (`AuthController` — `apps/api/src/modules/identity/presentation/http/auth.controller.ts`)

| HTTP Method & Route | Backend Done | Frontend Done | Current Frontend Location OR Where Needs Implementation | Description |
| :--- | :---: | :---: | :--- | :--- |
| `POST /auth/register` | [x] | [x] | `frontend/customer/src/redux/features/authApi.ts` (`registerCustomer`) → Register Modal | Customer registration with OTP trigger |
| `POST /auth/login` | [x] | [x] | `frontend/*/src/redux/features/authApi.ts` (`loginUser`) across all 6 applications | Email/password credential login |
| `POST /auth/refresh` | [x] | [x] | `frontend/*/src/redux/api/baseApi.ts` (Automatic 401 token refresh interceptor) | Access token rotation using refresh token |
| `POST /auth/change-password` | [x] | [x] | `frontend/*/src/redux/features/authApi.ts` (`changePassword`) in all 6 applications → Settings/Profile views | Authenticated password change with 8+ character validation |
| `POST /auth/logout` | [x] | [x] | `frontend/*/src/redux/features/authApi.ts` (`logoutUser`) across all 6 applications | Invalidate refresh token and session cookies |
| `GET /auth/me` | [x] | [x] | `frontend/*/src/redux/features/authApi.ts` (`getMe`) fallback | Fetch active authenticated profile |
| `PATCH /auth/me` | [x] | [x] | `frontend/*/src/redux/features/userApi.ts` (`updateMe`) | Update personal profile details |
| `POST /auth/verify-otp` | [x] | [x] | `frontend/customer/src/redux/features/authApi.ts` (`verifyOtpThunk`) | 5-digit verification code check |
| `POST /auth/forgot-password` | [x] | [x] | `frontend/customer/src/redux/features/authApi.ts` (`forgotPasswordThunk`) | Public reset password OTP dispatch |
| `POST /auth/reset-password` | [x] | [x] | `frontend/customer/src/redux/features/authApi.ts` (`resetPasswordThunk`) | Submit new password after OTP verification |
| `POST /auth/resend-otp` | [x] | [x] | `frontend/customer/src/redux/features/authApi.ts` (`resendOtpThunk`) | Resend 5-digit verification code |

---

### 1.2 User Profile & Staff Assignments (`MeController` — `apps/api/src/modules/identity/presentation/http/me.controller.ts`)

| HTTP Method & Route | Backend Done | Frontend Done | Current Frontend Location OR Where Needs Implementation | Description |
| :--- | :---: | :---: | :--- | :--- |
| `GET /me` | [x] | [x] | `frontend/*/src/redux/features/authApi.ts` (`getMe`) primary profile lookup | Retrieve current authenticated user profile |
| `GET /me/assignments` | [x] | [x] | `frontend/*/src/redux/features/authApi.ts` (`getMyAssignments`) in staff apps | Retrieve active branch staff role assignments and permissions |

---

### 1.3 User Management (`UserController` — `apps/api/src/modules/identity/presentation/http/user.controller.ts`)

| HTTP Method & Route | Backend Done | Frontend Done | Current Frontend Location OR Where Needs Implementation | Description |
| :--- | :---: | :---: | :--- | :--- |
| `PATCH /users/me` | [x] | [x] | `frontend/*/src/redux/features/userApi.ts` (`updateMe`) with avatar file upload | Profile updates with multipart avatar image upload |
| `GET /users/me` | [x] | [x] | `frontend/*/src/redux/features/userApi.ts` / `authApi.ts` (`getMe`) | Current user profile |
| `GET /users/me/assignments` | [x] | [x] | `frontend/*/src/redux/features/authApi.ts` (`getMyAssignments` fallback) | Staff role assignments lookup fallback |
| `GET /users` | [x] | [x] | `frontend/admin/src/redux/features/userApi.ts` (`getUsersList`) | Paginated user management directory |
| `GET /users/:id` | [x] | [x] | `frontend/admin/src/redux/features/userApi.ts` (`getUserById`) | Single user record detail |
| `PATCH /users/status/:id` | [x] | [x] | `frontend/admin/src/redux/features/userApi.ts` (`changeUserStatus`) | Toggle ACTIVE, INACTIVE, BANNED |
| `DELETE /users/:id` | [x] | [x] | `frontend/admin/src/redux/features/userApi.ts` (`deleteUser`) & `EmployeesView.tsx` | Soft delete user account |
| `POST /users/create-customer` | [x] | [x] | `frontend/customer/src/redux/features/userApi.ts` (`createCustomerUser`) | Direct customer profile creation |
| `POST /users/create-admin` | [x] | [x] | `frontend/admin/src/redux/features/userApi.ts` (`createAdminUser`) | Platform admin creation (SUPER_ADMIN only) |

---

### 1.4 Dynamic Roles & RBAC Matrix (`RoleController` — `apps/api/src/modules/authorization/presentation/http/role.controller.ts`)

| HTTP Method & Route | Backend Done | Frontend Done | Current Frontend Location OR Where Needs Implementation | Description |
| :--- | :---: | :---: | :--- | :--- |
| `GET /authorization/me` | [x] | [x] | `frontend/admin/src/redux/features/roleApi.ts` (`getMyCapabilities`), `usePermission.ts`, `PermissionGate.tsx` | Get assigned dynamic role and effective permissions for current user |
| `GET /authorization/permissions` | [x] | [x] | `frontend/admin/src/redux/features/roleApi.ts` (`getPermissions`) & `PermissionsView.tsx` (Dynamic Matrix) | Catalog of all system permissions grouped by module |
| `GET /authorization/roles` | [x] | [x] | `frontend/admin/src/redux/features/roleApi.ts` (`getRoles`) & `RoleOverviewCards.tsx` / `PermissionsView.tsx` | List all roles with user count and permission metrics |
| `POST /authorization/roles` | [x] | [x] | `frontend/admin/src/redux/features/roleApi.ts` (`createRole`) & `CreateRoleModal.tsx` | Create a new custom role with permission assignments |
| `GET /authorization/roles/:id` | [x] | [x] | `frontend/admin/src/redux/features/roleApi.ts` (`getRoleById`) & `PermissionsMatrix.tsx` | Get role details with checkbox matrix representation |
| `PATCH /authorization/roles/:id` | [x] | [x] | `frontend/admin/src/redux/features/roleApi.ts` (`updateRole`) & `PermissionsView.tsx` (`handleSaveRoleChanges`) | Update role metadata and checkbox permission matrix |
| `DELETE /authorization/roles/:id` | [x] | [x] | `frontend/admin/src/redux/features/roleApi.ts` (`deleteRole`) & `DeleteRoleModal.tsx` | Delete custom role (blocked if users assigned or system role) |
| `GET /authorization/users/:userId/role` | [x] | [x] | `frontend/admin/src/redux/features/roleApi.ts` (`getUserRole`) & `AssignUserRoleModal.tsx` | Get single assigned dynamic role and permissions for a user |
| `POST /authorization/users/:userId/role` | [x] | [x] | `frontend/admin/src/redux/features/roleApi.ts` (`assignUserRole`) & `AssignUserRoleModal.tsx` | Assign or reassign role to user (enforces exactly 1 role per user) |
| `DELETE /authorization/users/:userId/role` | [x] | [x] | `frontend/admin/src/redux/features/roleApi.ts` (`removeUserRole`) & `AssignUserRoleModal.tsx` | Revoke assigned dynamic role from a user |

---

## 2. Organization, Restaurant & Branch Hierarchy Domain

### 2.1 Organizations (`OrganizationController` — `apps/api/src/modules/organizations/presentation/http/organization.controller.ts`)

| HTTP Method & Route | Backend Done | Frontend Done | Current Frontend Location OR Where Needs Implementation | Description |
| :--- | :---: | :---: | :--- | :--- |
| `POST /organizations` | [x] | [x] | `frontend/admin/src/redux/features/restaurantApi.ts` (`createOrganization`) & `SettingsView.tsx` (New Org Modal) | Create a new tenant organization |
| `GET /organizations` | [x] | [x] | `frontend/admin/src/redux/features/restaurantApi.ts` (`getOrganizations`) | List all organizations |
| `GET /organizations/my` | [x] | [x] | `frontend/admin/src/redux/features/restaurantApi.ts` (`getMyOrganization`) | List organizations owned by logged-in user |
| `GET /organizations/:id` | [x] | [x] | `frontend/admin/src/redux/features/restaurantApi.ts` (`getOrganizationById`) & `SettingsView.tsx` (Fetch Details) | Get organization details by ID |
| `PATCH /organizations/:id` | [x] | [x] | `frontend/admin/src/redux/features/restaurantApi.ts` (`updateOrganization`) | Update organization details |
| `DELETE /organizations/:id` | [x] | [x] | `frontend/admin/src/redux/features/restaurantApi.ts` (`deleteOrganization`) & `SettingsView.tsx` (Delete Org button) | Delete organization |

---

### 2.2 Restaurants (`RestaurantController` — `apps/api/src/modules/restaurants/presentation/http/restaurant.controller.ts`)

| HTTP Method & Route | Backend Done | Frontend Done | Current Frontend Location OR Where Needs Implementation | Description |
| :--- | :---: | :---: | :--- | :--- |
| `POST /restaurants` | [x] | [x] | `frontend/admin/src/redux/features/restaurantApi.ts` (`createRestaurant`) | Create a new restaurant concept |
| `GET /restaurants` | [x] | [x] | `frontend/admin/src/redux/features/restaurantApi.ts` (`getRestaurants`) | List restaurants with search and pagination |
| `GET /restaurants/:id` | [x] | [x] | `frontend/admin/src/redux/features/restaurantApi.ts` (`getRestaurantById`) | Get restaurant details by ID |
| `PATCH /restaurants/:id` | [x] | [x] | `frontend/admin/src/redux/features/restaurantApi.ts` (`updateRestaurant`) | Update restaurant details |
| `DELETE /restaurants/:id` | [x] | [x] | `frontend/admin/src/redux/features/restaurantApi.ts` (`deleteRestaurant`) | Soft delete restaurant |

---

### 2.3 Branches (`BranchController` — `apps/api/src/modules/branches/presentation/http/branch.controller.ts`)

| HTTP Method & Route | Backend Done | Frontend Done | Current Frontend Location OR Where Needs Implementation | Description |
| :--- | :---: | :---: | :--- | :--- |
| `POST /branches` | [x] | [x] | `frontend/admin/src/redux/features/restaurantApi.ts` (`createBranch`) | Create a new physical venue branch |
| `GET /branches` | [x] | [x] | `frontend/admin/src/redux/features/restaurantApi.ts` (`getBranches`) | List branches with search and pagination |
| `GET /branches/:id` | [x] | [x] | `frontend/manager/src/redux/features/branchManagerApi.ts` (`getBranch`) & `frontend/admin/src/redux/features/restaurantApi.ts` (`getBranchById`) | Get branch details by ID |
| `PATCH /branches/:id` | [x] | [x] | `frontend/manager/src/redux/features/branchManagerApi.ts` (`updateBranch`) & `frontend/admin/src/redux/features/restaurantApi.ts` (`updateBranch`) | Update branch metadata |
| `DELETE /branches/:id` | [x] | [x] | `frontend/admin/src/redux/features/restaurantApi.ts` (`deleteBranch`) | Soft delete branch |
| `GET /branches/:id/settings` | [x] | [x] | `frontend/manager/src/redux/features/branchManagerApi.ts` (`getSettings`) & `frontend/admin/src/redux/features/restaurantApi.ts` (`getBranchSettings`) | Fetch branch order acceptance mode & tax/service rates |
| `PATCH /branches/:id/settings` | [x] | [x] | `frontend/manager/src/redux/features/branchManagerApi.ts` (`updateSettings`) & `frontend/admin/src/redux/features/restaurantApi.ts` (`updateBranchSettings`) | Update branch operational settings |
| `GET /branches/:id/operating-hours` | [x] | [x] | `frontend/manager/src/redux/features/branchManagerApi.ts` (`getOperatingHours`) | Get weekly operating schedule |
| `PUT /branches/:id/operating-hours` | [x] | [x] | `frontend/manager/src/redux/features/branchManagerApi.ts` (`updateOperatingHours`) | Set/replace weekly opening & closing hours |
| `GET /branches/:id/holidays` | [x] | [x] | `frontend/manager/src/redux/features/branchManagerApi.ts` (`getHolidays`) & `BranchConfigView.tsx` (Holiday Calendar) | View branch holiday calendar |
| `POST /branches/:id/holidays` | [x] | [x] | `frontend/manager/src/redux/features/branchManagerApi.ts` (`createHoliday`) & `BranchConfigView.tsx` (Add Holiday Modal) | Add holiday or special closure |
| `GET /branches/:id/staff` | [x] | [x] | `frontend/manager/src/redux/features/branchManagerApi.ts` (`getStaffAssignments`) & `frontend/admin/src/redux/features/restaurantApi.ts` (`getBranchStaff`) | List staff assigned to branch |
| `GET /branches/:id/staff/:staffId` | [x] | [x] | `frontend/manager/src/redux/features/branchManagerApi.ts` (`getStaffMember`) | Single staff assignment detail |
| `POST /branches/:id/staff` | [x] | [x] | `frontend/manager/src/redux/features/branchManagerApi.ts` (`createStaff`) & `frontend/admin/src/redux/features/restaurantApi.ts` (`createBranchStaff`) | Create new staff user and assign to branch |
| `POST /branches/:id/staff/assign` | [x] | [x] | `frontend/manager/src/redux/features/branchManagerApi.ts` (`assignStaff`) | Assign existing staff user to branch |
| `PATCH /branches/:id/staff/:staffId` | [x] | [x] | `frontend/manager/src/redux/features/branchManagerApi.ts` (`updateStaff`) & `StaffDetailView.tsx` (Role & Permissions Editor) | Update staff branch assignment role & permissions |
| `DELETE /branches/:id/staff/:staffId` | [x] | [x] | `frontend/admin/src/redux/features/restaurantApi.ts` (`deleteBranchStaff`) | Deactivate/remove staff from branch |

---

## 3. Menu & Catalog Domain--------------------------------

### 3.1 Menus & Categories (`MenuController` — `apps/api/src/modules/menus/presentation/controllers/menu.controller.ts`)

| HTTP Method & Route | Backend Done | Frontend Done | Current Frontend Location OR Where Needs Implementation | Description |
| :--- | :---: | :---: | :--- | :--- |
| `GET /menus/:branchId/categories` | [x] | [x] | `frontend/customer/src/redux/features/menuCategoryApi.ts`, cashier, kitchen, manager | Active categories list with counts |
| `GET /menus/:branchId/items` | [x] | [x] | `frontend/customer/src/redux/features/menuItemApi.ts`, waiter, cashier, kitchen, manager | Active menu items with search & category filter |
| `GET /menus/items/:itemId` | [x] | [x] | `frontend/customer/src/redux/features/menuItemApi.ts` (`findById`) | Item detail with add-ons & nutrition |
| `POST /menus/categories` | [x] | [x] | `frontend/manager/src/redux/features/branchManagerApi.ts` (`createCategory`) & `ManageCategoriesModal.tsx` | Create new category (e.g. Burgers, Drinks) |
| `PATCH /menus/categories/:id` | [x] | [x] | `frontend/manager/src/redux/features/branchManagerApi.ts` (`updateCategory`) & `ManageCategoriesModal.tsx` (inline edit) | Edit category details |
| `DELETE /menus/categories/:id` | [x] | [x] | `frontend/manager/src/redux/features/branchManagerApi.ts` (`deleteCategory`) & `ManageCategoriesModal.tsx` | Soft delete category |
| `POST /menus/items` | [x] | [x] | `frontend/manager/src/redux/features/branchManagerApi.ts` (`createMenuItem`) & `frontend/admin/src/redux/features/menu-items/menuItemApi.ts` (`rawMenuItemApi.create`) | Create dish/item with pricing & modifiers |
| `PATCH /menus/items/:itemId` | [x] | [x] | `frontend/manager/src/redux/features/branchManagerApi.ts` (`updateMenuItem`) & `frontend/admin/src/redux/features/menu-items/menuItemApi.ts` (`rawMenuItemApi.update`) | Update dish pricing, photos, modifiers |
| `DELETE /menus/items/:itemId` | [x] | [x] | `frontend/manager/src/redux/features/branchManagerApi.ts` (`deleteMenuItem`) & `MenuView.tsx` (Item card delete) | Soft delete menu item |

---

### 3.2 Legacy Menu Compatibility Endpoints (`MenuCompatibilityController` — `apps/api/src/modules/menus/presentation/controllers/menu-compatibility.controller.ts`)

| HTTP Method & Route | Backend Done | Frontend Done | Current Frontend Location OR Where Needs Implementation | Description |
| :--- | :---: | :---: | :--- | :--- |
| `GET /menu-categories` | [x] | [x] | `frontend/customer/src/redux/features/menuCategoryApi.ts` | Legacy category listing by restaurant/branch query params |
| `GET /menu-categories/:id` | [x] | [x] | `frontend/customer/src/redux/features/menuCategoryApi.ts` | Legacy single category detail |
| `GET /menu-items` | [x] | [x] | `frontend/customer/src/redux/features/menuItemApi.ts` | Legacy items listing with search and category filters |
| `GET /menu-items/:itemId` | [x] | [x] | `frontend/customer/src/redux/features/menuItemApi.ts` | Legacy single item specifications and add-ons |

---

## 4. Tables, Floor & Reservation Domain

### 4.1 Tables & Floor Plan (`TableController` — `apps/api/src/modules/tables/presentation/http/table.controller.ts`)

| HTTP Method & Route | Backend Done | Frontend Done | Current Frontend Location OR Where Needs Implementation | Description |
| :--- | :---: | :---: | :--- | :--- |
| `GET /tables/resolve-qr/:token` | [x] | [x] | `frontend/customer/src/lib/qrSession.ts` | Resolve scanned QR token to branch & table |
| `POST /tables` | [x] | [x] | `frontend/manager/src/redux/features/branchManagerApi.ts` (`createTable`) | Create dining table |
| `GET /tables` | [x] | [x] | `frontend/manager/src/redux/features/branchManagerApi.ts` (`getTables`), waiter, cashier | List tables by branch query param |
| `GET /tables/branch/:branchId` | [x] | [x] | Alternative path route to `GET /tables?branchId=...` | List tables by branch path param |
| `GET /tables/:id` | [x] | [x] | `frontend/manager/src/redux/features/branchManagerApi.ts` (`getTable`) | Single table detail |
| `PATCH /tables/:id` | [x] | [x] | `frontend/manager/src/redux/features/branchManagerApi.ts` (`updateTable`), `EditTableModal.tsx` in `TablesView`, `TableDetailView`, `BranchConfigView` | Update table capacity, label, shape, floor, status |
| `POST /tables/:id/regenerate-qr` | [x] | [x] | `frontend/manager/src/redux/features/branchManagerApi.ts` (`regenerateQr`) | Rotate opaque QR token for table |
| `DELETE /tables/:id` | [x] | [x] | `frontend/manager/src/redux/features/branchManagerApi.ts` (`deleteTable`), Delete buttons with confirmation in `TablesView`, `TableDetailView`, `BranchConfigView` | Soft delete table |
| `POST /tables/reservations` | [x] | [x] | `frontend/customer/src/redux/features/reservationApi.ts` (`createReservation`), `InstantReserveModal.tsx` & `frontend/manager/src/redux/features/branchManagerApi.ts` (`createReservation`), `TablesView.tsx` | Book table reservation |
| `GET /tables/reservations/branch/:branchId` | [x] | [x] | `frontend/manager/src/redux/features/branchManagerApi.ts` (`getReservations`) & Manager `TablesView.tsx` (Reservations tab) | List reservations for branch |
| `GET /tables/reservations/:id` | [x] | [x] | `frontend/manager/src/redux/features/branchManagerApi.ts` (`getReservation`) & Manager `TablesView.tsx` (Reservation detail modal) | View single reservation details |
| `PATCH /tables/reservations/:id/status` | [x] | [x] | `frontend/manager/src/redux/features/branchManagerApi.ts` (`updateReservationStatus`) & Manager `TablesView.tsx` | Update status (CONFIRMED, SEATED, CANCELLED) |
| `DELETE /tables/reservations/:id` | [x] | [x] | `frontend/manager/src/redux/features/branchManagerApi.ts` (`deleteReservation`) & Manager `TablesView.tsx` | Cancel reservation |

---

## 5. Table Sessions & Customer Experience Domain

### 5.1 Sessions (`TableSessionController` — `apps/api/src/modules/table-sessions/presentation/table-session.controller.ts`)

| HTTP Method & Route | Backend Done | Frontend Done | Current Frontend Location OR Where Needs Implementation | Description |
| :--- | :---: | :---: | :--- | :--- |
| `POST /sessions/table-otp/request` | [x] | [x] | `frontend/customer/src/redux/features/sessionApi.ts` (`requestTableOtp`) | Send 5-digit table login OTP |
| `POST /sessions/table-otp/verify` | [x] | [x] | `frontend/customer/src/redux/features/sessionApi.ts` (`verifyTableOtp`) | Verify OTP & issue guest session JWT |
| `POST /sessions/scan` | [x] | [x] | `frontend/customer/src/redux/features/sessionApi.ts` (`scanQr`) | QR scan handler (creates or joins session) |
| `GET /sessions/branch/:branchId` | [x] | [x] | `frontend/manager/src/redux/features/branchManagerApi.ts` (`getBranchSessions`), `TablesView.tsx` & `frontend/cashier/src/redux/features/cashierApi.ts` (`getBranchSessions`) | List active table sessions with occupancy |
| `GET /sessions/:sessionId` | [x] | [x] | `frontend/customer/src/redux/features/sessionApi.ts` (`getSession`) | Active session and seated guests list |
| `POST /sessions/:sessionId/share-code` | [x] | [x] | `frontend/customer/src/redux/features/sessionApi.ts` (`generateShareCode`) | Generate 6-character companion join code |
| `POST /sessions/join` | [x] | [x] | `frontend/customer/src/redux/features/sessionApi.ts` (`joinSession`) | Join dining table via companion code |
| `PATCH /sessions/order-mode` | [x] | [x] | `frontend/customer/src/redux/features/sessionApi.ts` (`setOrderMode`) | Toggle individual vs. group order mode |
| `POST /sessions/:sessionId/request-bill` | [x] | [x] | `frontend/customer/src/redux/features/sessionApi.ts` (`requestBill`) & `frontend/customer/src/app/orders/track/page.tsx` ("Request Bill from Waiter") | Dedicated customer bill request to floor staff |
| `POST /sessions/:sessionId/call-waiter` | [x] | [x] | `frontend/customer/src/redux/features/sessionApi.ts` (`callWaiter`), `frontend/customer/src/app/orders/track/page.tsx` & `frontend/customer/src/app/chat/page.tsx` | Direct session waiter call alert |
| `POST /sessions/:sessionId/close` | [x] | [x] | `frontend/customer/src/redux/features/sessionApi.ts` (`closeSession`) & `cashierApi.ts` | Close table session upon payment |

---

### 5.2 Feedback & Reviews (`FeedbackController` — `apps/api/src/modules/customer-sessions/feedback.service-controller.ts`)

| HTTP Method & Route | Backend Done | Frontend Done | Current Frontend Location OR Where Needs Implementation | Description |
| :--- | :---: | :---: | :--- | :--- |
| `POST /feedback` | [x] | [x] | `frontend/customer/src/redux/features/feedbackApi.ts` (`submitFeedback`), `frontend/customer/src/app/feedback/page.tsx` & `FeedbackModal.tsx` | Submit 1–5 star order rating and comments |
| `GET /feedback/order/:orderId` | [x] | [x] | `frontend/customer/src/redux/features/feedbackApi.ts` (`getFeedbackByOrder`), `orders/track/page.tsx` & `FeedbackModal.tsx` | Check if order has already been reviewed |

---

## 6. Orders & Kitchen Execution Domain

### 6.1 Orders (`OrderController` — `apps/api/src/modules/orders/presentation/controllers/order.controller.ts`)

| HTTP Method & Route | Backend Done | Frontend Done | Current Frontend Location OR Where Needs Implementation | Description |
| :--- | :---: | :---: | :--- | :--- |
| `GET /orders/cart` | [x] | [x] | `frontend/customer/src/redux/features/orderApi.ts` (`getCartFromSession`) | Active cart by session |
| `GET /orders/cart/:branchId/:tableId` | [x] | [x] | `frontend/customer/src/redux/features/orderApi.ts` (`getCart`) | Active cart by table & branch params |
| `GET /orders/me` | [x] | [x] | `frontend/customer/src/redux/features/orderApi.ts` (`getMyOrders`) | My orders in current table stay |
| `POST /orders/cart/:orderId/items` | [x] | [x] | `frontend/customer/src/redux/features/orderApi.ts` (`addItem`) | Add dish and modifiers to cart |
| `PATCH /orders/cart/:orderId/items/:itemId` | [x] | [x] | `frontend/customer/src/redux/features/orderApi.ts` (`updateItem`) | Update cart quantity or special notes |
| `DELETE /orders/cart/:orderId/items/:itemId` | [x] | [x] | `frontend/customer/src/redux/features/orderApi.ts` (`removeItem`) | Remove line item from cart |
| `POST /orders/:orderId/submit` | [x] | [x] | `frontend/customer/src/redux/features/orderApi.ts` (`submitOrder`) | Submit cart to waiter review queue |
| `GET /orders/:orderId/track` | [x] | [x] | `frontend/customer/src/redux/features/orderApi.ts` (`trackOrder`) | Live order timeline milestones |
| `GET /orders/branch/:branchId` | [x] | [x] | Waiter, Kitchen, Cashier, Manager (`getOrders`) | List branch orders with status filter |
| `GET /orders/:orderId` | [x] | [x] | Customer, Waiter, Manager (`getOrderDetail`) | Complete order specifications |
| `PATCH /orders/:orderId/status` | [x] | [x] | Waiter, Kitchen, Manager (`updateOrderStatus`) | Transition order lifecycle status |
| `DELETE /orders/:orderId` | [x] | [ ] | **Where to implement:** `frontend/waiter/src/redux/features/waiterApi.ts` (`cancelOrder`) & `frontend/manager/src/redux/features/branchManagerApi.ts` | Cancel order (transition to CANCELLED) |

---

### 6.2 Waiter Operations (`WaiterController` — `apps/api/src/modules/waiter/presentation/http/waiter.controller.ts`)

| HTTP Method & Route | Backend Done | Frontend Done | Current Frontend Location OR Where Needs Implementation | Description |
| :--- | :---: | :---: | :--- | :--- |
| `GET /waiter/tables` | [x] | [x] | `frontend/waiter/src/redux/features/waiterApi.ts` (`getMyTables`) | Assigned tables for shift |
| `POST /waiter/tables/assign` | [x] | [x] | `frontend/manager/src/redux/features/branchManagerApi.ts` (`assignWaiterToTable`) | Manager assigns table to waiter |
| `POST /waiter/tables/unassign` | [x] | [x] | `frontend/manager/src/redux/features/branchManagerApi.ts` (`unassignWaiterTable`) | Manager unassigns dining table from waiter |
| `DELETE /waiter/tables/assign/:assignmentId` | [x] | [x] | `frontend/manager/src/redux/features/branchManagerApi.ts` (`unassignWaiterTable` via assignment UUID) | Deactivate specific table assignment record |
| `GET /waiter/tables/assignments` | [x] | [x] | `frontend/manager/src/redux/features/branchManagerApi.ts` (`getBranchAssignments`) | List active branch table assignments with waiter & table details |
| `GET /waiter/orders` | [x] | [x] | `frontend/waiter/src/redux/features/waiterApi.ts` (`queryOrders`) | Orders at assigned tables |
| `GET /waiter/orders/pending` | [x] | [x] | `frontend/waiter/src/redux/features/waiterApi.ts` (`getPendingOrders`) | Queue of submitted orders awaiting approval |
| `GET /waiter/orders/active` | [x] | [x] | `frontend/waiter/src/redux/features/waiterApi.ts` (`getActiveOrders`) | Orders in prep and ready states |
| `GET /waiter/orders/:id` | [x] | [x] | `frontend/waiter/src/redux/features/waiterApi.ts` (`getOrderDetail`) | Full waiter order breakdown |
| `POST /waiter/orders/:id/accept` | [x] | [x] | `frontend/waiter/src/redux/features/waiterApi.ts` (`acceptOrder`) | Accept order and route to KDS |
| `POST /waiter/orders/:id/reject` | [x] | [x] | `frontend/waiter/src/redux/features/waiterApi.ts` (`rejectOrder`) | Reject order with standardized reason |
| `POST /waiter/orders/:id/serve` | [x] | [x] | `frontend/waiter/src/redux/features/waiterApi.ts` (`serveOrder`) | Mark READY order as SERVED |
| `POST /waiter/orders` | [x] | [x] | `frontend/waiter/src/redux/features/waiterApi.ts` (`createOrderOnBehalf`) | Punch in order on behalf of customer |
| `GET /waiter/alerts` | [x] | [x] | `frontend/waiter/src/redux/features/waiterApi.ts` (`getMyAlerts`) | Active table assistance alerts |
| `PATCH /waiter/alerts/:id/acknowledge` | [x] | [x] | `frontend/waiter/src/redux/features/waiterApi.ts` (`ackAlert`) | Acknowledge assistance alert |
| `PATCH /waiter/alerts/:id/resolve` | [x] | [x] | `frontend/waiter/src/redux/features/waiterApi.ts` (`resolveAlert`) | Resolve assistance alert |
| `POST /alerts` | [x] | [x] | `frontend/waiter/src/redux/features/waiterApi.ts` (`createAlert`) & `paymentApi.ts` | Customer creates alert to floor staff |

---

### 6.3 Kitchen Display System (`KitchenController` — `apps/api/src/modules/kitchen/presentation/http/kitchen.controller.ts`)

| HTTP Method & Route | Backend Done | Frontend Done | Current Frontend Location OR Where Needs Implementation | Description |
| :--- | :---: | :---: | :--- | :--- |
| `GET /kitchen/tickets/:branchId` | [x] | [x] | `frontend/kitchen/src/redux/features/kitchenApi.ts` (`getActiveTickets`) | Station-routed tickets (KITCHEN vs. BAR) |
| `PATCH /kitchen/items/:itemId/status` | [x] | [x] | `frontend/kitchen/src/redux/features/kitchenApi.ts` (`updateItemStatus`) | Individual item prep status (PREPARING, READY) |
| `PATCH /kitchen/menu-items/:menuItemId/availability` | [x] | [x] | `frontend/kitchen/src/redux/features/kitchenApi.ts` (`toggleMenuItemAvailability`) | 86 / Out-of-stock toggle directly from KDS |

---

## 7. Billing, Payments & Discounts Domain

### 7.1 Core Payments & Billing (`PaymentController` — `apps/api/src/modules/payments/presentation/payment.controller.ts`)

| HTTP Method & Route | Backend Done | Frontend Done | Current Frontend Location OR Where Needs Implementation | Description |
| :--- | :---: | :---: | :--- | :--- |
| `GET /payments/options` | [x] | [x] | Customer `paymentApi.ts` & Cashier `cashierApi.ts` | Available payment gateway options |
| `POST /payments` | [x] | [x] | Customer `paymentApi.ts` & Cashier `cashierApi.ts` | Process single bill payment |
| `POST /payments/split` | [x] | [x] | Customer `paymentApi.ts` & Cashier `cashierApi.ts` | Process itemized or equal split payment |
| `POST /payments/discounts/apply` | [x] | [x] | Customer `paymentApi.ts` & Cashier `cashierApi.ts` (`validateDiscount`) | Validate promo voucher & calculate discount |
| `POST /payments/discounts/validate` | [x] | [x] | Customer `paymentApi.ts` & Cashier `cashierApi.ts` (`validateDiscount`) | Alias validation endpoint |
| `POST /payments/:id/refund` | [x] | [x] | `frontend/cashier/src/redux/features/cashierApi.ts` (`refundPayment`) | Process full or partial refund |
| `GET /payments/:id` | [x] | [ ] | **Where to implement:** `frontend/cashier/src/redux/features/cashierApi.ts` (`getPaymentReceipt`) & Cashier Receipt modal | Fetch payment receipt breakdown |
| `GET /payments/order/:orderId` | [x] | [ ] | **Where to implement:** `frontend/cashier/src/redux/features/cashierApi.ts` & Manager Order Detail | Get all payments under specific order |
| `GET /payments/session/:sessionId/bill` | [x] | [ ] | **Where to implement:** `frontend/cashier/src/redux/features/cashierApi.ts` & Customer Checkout view | Authoritative bill total and balance due |
| `GET /payments` | [x] | [x] | `frontend/admin/src/redux/features/adminApi.ts` (`getPayments`) & `PaymentsView.tsx` | List customer order payments for an organization or branch with search and pagination |

---

### 7.2 Stripe Online Payment Flow (`PaymentController`)

| HTTP Method & Route | Backend Done | Frontend Done | Current Frontend Location OR Where Needs Implementation | Description |
| :--- | :---: | :---: | :--- | :--- |
| `POST /payments/stripe/create-intent` | [x] | [x] | `frontend/customer/src/redux/features/paymentApi.ts` (`createStripePaymentIntent`) | Calculates balance & generates Stripe client secret |
| `POST /payments/stripe/verify` | [x] | [x] | `frontend/customer/src/redux/features/paymentApi.ts` (`verifyStripePayment`) | Confirm PaymentIntent status and settle order |
| `POST /payments/stripe/webhook` | [x] | [x] | Backend webhook receiver (`handleStripeWebhook`) with HMAC signature check | Webhook listener for asynchronous Stripe settlement |

---

### 7.3 Cashier Offline Cash/Card Payment Flow (`PaymentController`)

| HTTP Method & Route | Backend Done | Frontend Done | Current Frontend Location OR Where Needs Implementation | Description |
| :--- | :---: | :---: | :--- | :--- |
| `POST /payments/request-offline` | [x] | [x] | `frontend/customer/src/redux/features/paymentApi.ts` (`requestOfflinePayment`) | Customer requests cash/terminal payment at table |
| `GET /payments/offline/requests` | [x] | [x] | `frontend/cashier/src/redux/features/cashierApi.ts` (`getOfflinePaymentRequests`) | Cashier fetches pending physical payment requests |
| `POST /payments/confirm-offline` | [x] | [x] | Backend alternate body route (`paymentId` in body) | Alternate cashier payment confirmation |
| `POST /payments/offline/:id/confirm` | [x] | [x] | `frontend/cashier/src/redux/features/cashierApi.ts` (`confirmOfflinePayment`) | Cashier confirms cash receipt, releases table |
| `POST /payments/reject-offline` | [x] | [x] | Backend alternate body route (`paymentId` in body) | Alternate cashier payment rejection |
| `POST /payments/offline/:id/reject` | [x] | [x] | `frontend/cashier/src/redux/features/cashierApi.ts` (`rejectOfflinePayment`) | Cashier rejects request, returns session to ACTIVE |

---

## 8. Shifts & Attendance Domain

### 8.1 Work Shifts (`ShiftController` — `apps/api/src/modules/shifts/presentation/shift.controller.ts`)

| HTTP Method & Route | Backend Done | Frontend Done | Current Frontend Location OR Where Needs Implementation | Description |
| :--- | :---: | :---: | :--- | :--- |
| `POST /shifts` | [x] | [ ] | **Where to implement:** `frontend/manager/src/redux/features/branchManagerApi.ts` (`createShift`) & Manager Staff Schedule modal | Schedule shift slot for staff |
| `GET /shifts/branch/:branchId` | [x] | [x] | `frontend/kitchen/src/redux/features/kitchenApi.ts` & `frontend/manager/src/redux/features/branchManagerApi.ts` (`getShifts`) | Branch shifts list |
| `GET /shifts/staff/:staffAssignmentId` | [x] | [ ] | **Where to implement:** `frontend/waiter/src/redux/features/waiterApi.ts` & Waiter Schedule view | My scheduled shifts |
| `GET /shifts/:id` | [x] | [ ] | **Where to implement:** `frontend/manager/src/redux/features/branchManagerApi.ts` | Shift detail by ID |
| `PATCH /shifts/:id/clock-in` | [x] | [ ] | **Where to implement:** `frontend/waiter/src/redux/features/waiterApi.ts` & `frontend/kitchen/src/redux/features/kitchenApi.ts` (Header Clock-In button) | Staff attendance clock-in |
| `PATCH /shifts/:id/clock-out` | [x] | [ ] | **Where to implement:** `frontend/waiter/src/redux/features/waiterApi.ts` & `frontend/kitchen/src/redux/features/kitchenApi.ts` (Header Clock-Out button) | Staff attendance clock-out |
| `PATCH /shifts/:id/cancel` | [x] | [ ] | **Where to implement:** `frontend/manager/src/redux/features/branchManagerApi.ts` (`cancelShift`) | Cancel scheduled shift |
| `DELETE /shifts/:id` | [x] | [ ] | **Where to implement:** `frontend/manager/src/redux/features/branchManagerApi.ts` (`deleteShift`) | Soft delete scheduled shift |

---

## 9. Inventory & Suppliers Domain

### 9.1 Inventory Management (`InventoryController` — `apps/api/src/modules/inventory/presentation/inventory.controller.ts`)

| HTTP Method & Route | Backend Done | Frontend Done | Current Frontend Location OR Where Needs Implementation | Description |
| :--- | :---: | :---: | :--- | :--- |
| `POST /inventory/suppliers` | [x] | [x] | `frontend/admin/src/redux/features/inventoryApi.ts` (`createSupplier`) | Register supplier |
| `GET /inventory/suppliers/branch/:branchId` | [x] | [x] | `frontend/admin/src/redux/features/inventoryApi.ts` (`getSuppliers`) | List branch suppliers |
| `GET /inventory/suppliers/:id` | [x] | [ ] | **Where to implement:** `frontend/admin/src/redux/features/inventoryApi.ts` & Supplier Detail drawer | Supplier details by ID |
| `PATCH /inventory/suppliers/:id` | [x] | [x] | `frontend/admin/src/redux/features/inventoryApi.ts` (`updateSupplier`) | Update supplier details |
| `DELETE /inventory/suppliers/:id` | [x] | [x] | `frontend/admin/src/redux/features/inventoryApi.ts` (`deleteSupplier`) | Soft delete supplier |
| `POST /inventory/categories` | [x] | [x] | `frontend/admin/src/redux/features/inventoryApi.ts` (`createCategory`) | Create stock category |
| `GET /inventory/categories/branch/:branchId` | [x] | [x] | `frontend/admin/src/redux/features/inventoryApi.ts` (`getCategories`) | List stock categories |
| `GET /inventory/categories/:id` | [x] | [ ] | **Where to implement:** `frontend/admin/src/redux/features/inventoryApi.ts` | Stock category by ID |
| `PATCH /inventory/categories/:id` | [x] | [ ] | **Where to implement:** `frontend/admin/src/redux/features/inventoryApi.ts` (`updateCategory`) | Update stock category |
| `DELETE /inventory/categories/:id` | [x] | [x] | `frontend/admin/src/redux/features/inventoryApi.ts` (`deleteCategory`) | Delete stock category |
| `POST /inventory/items` | [x] | [x] | `frontend/admin/src/redux/features/inventoryApi.ts` (`createItem`) | Create inventory item |
| `GET /inventory/items/branch/:branchId` | [x] | [x] | Kitchen, Manager, Admin (`getBranchItems`) | List stock items with lowStock filter |
| `GET /inventory/items/:id` | [x] | [x] | `frontend/admin/src/redux/features/inventoryApi.ts` (`getItemById`) | Single inventory item detail |
| `PATCH /inventory/items/:id` | [x] | [x] | `frontend/admin/src/redux/features/inventoryApi.ts` (`updateItem`) | Update stock item info |
| `DELETE /inventory/items/:id` | [x] | [x] | `frontend/admin/src/redux/features/inventoryApi.ts` (`deleteItem`) | Soft delete stock item |
| `PATCH /inventory/items/:id/adjust` | [x] | [x] | Kitchen, Manager, Admin (`adjustStock`) | Adjust stock quantity with reason |
| `GET /inventory/summary/branch/:branchId` | [x] | [x] | Manager & Admin (`getInventorySummary`) | Branch stock count & low-stock alerts |

---

## 10. Notifications Subsystem

### 10.1 Notifications (`NotificationController` — `apps/api/src/modules/notifications/presentation/http/notification.controller.ts`)

| HTTP Method & Route | Backend Done | Frontend Done | Current Frontend Location OR Where Needs Implementation | Description |
| :--- | :---: | :---: | :--- | :--- |
| `GET /notifications` | [x] | [x] | Standardized in `baseApi.ts` (`getNotifications`) & `<NotificationCenter />` | Paginated notifications for current user |
| `GET /notifications/unread-count` | [x] | [x] | Standardized in `baseApi.ts` (`getUnreadCount`) & Header unread badges | Unread notification count |
| `POST /notifications` | [x] | [ ] | **Where to implement:** `frontend/admin/src/redux/api/baseApi.ts` & Admin Platform Broadcast modal | Create/dispatch notification |
| `PATCH /notifications/:id/read` | [x] | [x] | Standardized in `baseApi.ts` (`markAsRead`) & `<NotificationCenter />` | Mark single notification as read |
| `PATCH /notifications/mark-all-read` | [x] | [x] | Standardized in `baseApi.ts` (`markAllAsRead`) & `<NotificationCenter />` | Mark all notifications read |
| `DELETE /notifications/:id` | [x] | [ ] | **Where to implement:** `frontend/*/src/redux/api/baseApi.ts` & `<NotificationCenter />` (Dismiss action) | Delete notification from tray |

---

## 11. Realtime WebSocket Gateway Subsystem (Socket.IO)

### 11.1 Realtime Gateway (`RealtimeGateway` — `apps/api/src/modules/realtime/realtime.gateway.ts`)

> *Room Partitioning: `user:<id>`, `branch:<id>`, `table:<id>`, `session:<id>`, `order:<id>`, `branch:<id>:waiter`, `branch:<id>:cashier`, `branch:<id>:kitchen:<stationType>`.*

| Event / Topic Name | Direction | Backend Done | Frontend Consumed | Active Consumers / Handlers | Description |
| :--- | :---: | :---: | :---: | :--- | :--- |
| `join_room` | Client → Server | [x] | [x] | Frontends join authorized room channels on connection | Client requests room subscription |
| `leave_room` | Client → Server | [x] | [x] | Frontends leave room channels on route transitions | Client leaves room subscription |
| `TABLE_STATUS_CHANGED` | Server → Client | [x] | [x] | Manager Floor Map, Waiter Tables view, Customer Session | Live table status (AVAILABLE, SEATED, DIRTY, RESERVED) |
| `TABLE_SESSION_STATUS_CHANGED` | Server → Client | [x] | [x] | Customer header, Cashier table monitors, Waiter app | Session transitions (ACTIVE, BILL_REQUESTED, CLOSED) |
| `ORDER_CREATED` | Server → Client | [x] | [x] | Waiter Orders Queue, Manager live orders, Customer timeline | Dispatched when customer submits cart |
| `ORDER_STATUS_CHANGED` | Server → Client | [x] | [x] | Customer Order Tracker, Waiter, Kitchen KDS, Cashier POS | Order status transitions (PENDING, APPROVED, PREPARING, READY, SERVED) |
| `ORDER_ITEM_STATUS_CHANGED` | Server → Client | [x] | [x] | Kitchen Station KDS, Bartender Screen, Customer Tracker | Granular station item status update |
| `PAYMENT_STATUS_CHANGED` | Server → Client | [x] | [x] | Customer Checkout screen, Cashier POS, Waiter table view | Payment completion / failure notification |
| `PAYMENT_REQUESTED` | Server → Client | [x] | [x] | Cashier offline queue, Waiter alerts | Customer requested offline bill settlement |
| `NOTIFICATION_CREATED` | Server → Client | [x] | [x] | All 6 frontends `<NotificationCenter />` | Real-time push alert dispatched to user/role |
| `NOTIFICATION_READ` | Server → Client | [x] | [x] | Header notification badges | Synchronize read status across multiple client tabs |

---

## 12. System, Health, Mailer & Storage

### 12.1 System Health & Diagnostics (`AppController` — `apps/api/src/app.controller.ts`)

| HTTP Method & Route | Backend Done | Frontend Done | Current Frontend Location OR Where Needs Implementation | Description |
| :--- | :---: | :---: | :--- | :--- |
| `GET /health` | [x] | [x] | Devops & Docker healthchecks / ECS target group monitors | Application liveness & DB connection check |
| `GET /` | [x] | [x] | Root API check | Service banner and Swagger docs link (`/docs`) |

---

### 12.2 Mailer Diagnostics (`MailController` — `apps/api/src/modules/notifications/presentation/http/mail.controller.ts`)

| HTTP Method & Route | Backend Done | Frontend Done | Current Frontend Location OR Where Needs Implementation | Description |
| :--- | :---: | :---: | :--- | :--- |
| `POST /mail/test-send` | [x] | [ ] | **Where to implement:** `frontend/admin/src/app/admin-dashboard/settings/` (Email Diagnostics tab) | Test custom email dispatch via SES/Queue |
| `POST /mail/test-otp` | [x] | [ ] | **Where to implement:** `frontend/admin/src/app/admin-dashboard/settings/` (Email Diagnostics tab) | Test OTP template email dispatch |
| `GET /mail/status` | [x] | [ ] | **Where to implement:** `frontend/admin/src/app/admin-dashboard/settings/` (Email Diagnostics tab) | Check mail queue & SES connectivity |

---

### 12.3 Storage & File Service (`StorageController` — `apps/api/src/modules/storage/storage.controller.ts`)

| HTTP Method & Route | Backend Done | Frontend Done | Current Frontend Location OR Where Needs Implementation | Description |
| :--- | :---: | :---: | :--- | :--- |
| `POST /storage/upload` | [x] | [x] | `frontend/*/src/redux/features/userApi.ts` (`updateMe`) for profile avatar upload | Multipart direct file upload to S3 |
| `POST /storage/upload/base64` | [x] | [ ] | **Where to implement:** `frontend/manager/src/redux/features/branchManagerApi.ts` (Quick canvas/signature upload) | Base64 image/document upload |
| `POST /storage/presigned-upload-url` | [x] | [ ] | **Where to implement:** `frontend/manager` & `frontend/admin` Media/Menu Upload component | Direct client-to-S3 high-speed PUT upload |
| `POST /storage/presigned-post` | [x] | [ ] | **Where to implement:** Browser direct form uploads | Direct browser HTML form POST policy |
| `POST /storage/presigned-download-url` | [x] | [ ] | **Where to implement:** Sensitive invoice/receipt download actions | Secure time-limited private file link |
| `GET /storage/file` | [x] | [ ] | **Where to implement:** Image proxy viewer | Stream object from S3 via API proxy |
| `GET /storage/file/info` | [x] | [ ] | **Where to implement:** Admin Media Library | Get S3 object metadata and size |
| `GET /storage/file/exists` | [x] | [ ] | **Where to implement:** File verification utilities | Check if S3 key exists |
| `GET /storage/files` | [x] | [ ] | **Where to implement:** `frontend/admin/src/app/admin-dashboard/media/` (Media Asset Manager) | List files and folders by prefix |
| `DELETE /storage/file` | [x] | [ ] | **Where to implement:** `frontend/admin/src/app/admin-dashboard/media/` | Delete single file from S3 |
| `POST /storage/files/delete-batch` | [x] | [ ] | **Where to implement:** `frontend/admin/src/app/admin-dashboard/media/` | Batch delete up to 1000 files from S3 |

---

## 13. AI Subsystem & Runtime Gateways

### 13.1 Internal AI Tool Gateway (`InternalAiController` — `apps/api/src/modules/ai/presentation/http/internal-ai.controller.ts`)

> *Note: These are `/internal/*` routes protected by `InternalServiceGuard`. They are consumed strictly by the Python AI agent runtime (`apps/ai`), not called directly by the browser.*

| HTTP Method & Route | Backend Done | Python AI Runtime Done | Description |
| :--- | :---: | :---: | :--- |
| `POST /internal/auth/resolve-actor` | [x] | [x] | Resolves customer/staff JWT into validated ActorContext |
| `GET /internal/context/bootstrap` | [x] | [x] | Fetches operational snapshot of branch tables & sessions |
| `POST /internal/tools/execute` | [x] | [x] | Executes approved domain tools (menu search, order placement, alerts) |
| `POST /internal/tools/execute/confirm` | [x] | [x] | Confirms sensitive mutations (order submission, payment) |
| `POST /internal/audit` | [x] | [x] | Ingests structured AI action events into audit log |

---

### 13.2 Python AI Runtime Microservice (`apps/ai/src/main.py` — FastAPI)

| HTTP Method & Route | Microservice Done | Frontend Done | Current Frontend Location OR Where Needs Implementation | Description |
| :--- | :---: | :---: | :--- | :--- |
| `GET /health` | [x] | [x] | Devops healthcheck | Python microservice health status |
| `GET /` | [x] | [x] | Root API check | Service banner and environment info |
| `POST /ai/chat` | [x] | [x] | `frontend/customer/src/redux/features/chatApi.ts` & `frontend/waiter/src/redux/features/chatApi.ts` | Dining concierge AI assistant conversation |
| `POST /ai/chat/stream` | [x] | [ ] | **Where to implement:** `frontend/*/src/redux/features/chatApi.ts` (Streaming SSE listener) | Streaming token-by-token chat response |
| `POST /ai/voice/transcribe` | [x] | [x] | `frontend/waiter/src/redux/features/chatApi.ts` (`transcribeAudio`) & `frontend/waiter/src/hooks/useJarvisVoice.ts` | Audio speech-to-text transcription via Whisper STT |
| `POST /ai/voice/synthesize` | [x] | [x] | `frontend/waiter/src/redux/features/chatApi.ts` (`fetchVoiceAudioBlob`), `useJarvisVoice.ts` & `frontend/kitchen` (`KitchenAIModal.tsx`) | Text-to-speech neural audio synthesis (POST payload) |
| `GET /ai/voice/synthesize` | [x] | [x] | Consumed via GET stream queries in `chatApi.ts` audio playback components | Stream synthesized speech audio directly via query params |

---

## 14. Business Intelligence & Analytics Domain

### 14.1 Operational Analytics & Reporting (`AnalyticsController` — `apps/api/src/modules/analytics/presentation/http/analytics.controller.ts`)

| HTTP Method & Route | Backend Done | Frontend Done | Current Frontend Location OR Where Needs Implementation | Description |
| :--- | :---: | :---: | :--- | :--- |
| `GET /analytics/overview` | [x] | [x] | `frontend/admin/src/redux/features/adminApi.ts` (`getAnalyticsOverview`) & `DashboardView.tsx` | Organization and branch operational KPI snapshot (revenue, active orders, occupancy) |
| `GET /analytics/reports/branch-performance` | [x] | [x] | `frontend/admin/src/redux/features/adminApi.ts` (`getBranchPerformance`) & `DashboardView.tsx` | Per-branch order volume and revenue comparisons across venues |

---

## 🎯 Categorized Pending Frontend Action Checklist (Faka Checklist by App)

To achieve 100% full-stack parity across all features, implement the following 40 categorized endpoints in their target frontend applications:

### 📱 1. Customer Application (`@frontend/customer`)
- [x] **Table Reservations:** Implemented in `frontend/customer/src/redux/features/reservationApi.ts` (`createReservation`) & `InstantReserveModal.tsx`.
- [x] **Direct Waiter Call & Bill Request:** Implemented in `frontend/customer/src/redux/features/sessionApi.ts` (`callWaiter`, `requestBill`), `orders/track/page.tsx`, and `chat/page.tsx`.
- [ ] **Authoritative Session Bill Lookup:** Wire up `GET /payments/session/:sessionId/bill` in `frontend/customer/src/redux/features/paymentApi.ts` before settling checkout.
- [ ] **Streaming AI Concierge:** Wire up `POST /ai/chat/stream` in `frontend/customer/src/redux/features/chatApi.ts` for real-time token-by-token streaming responses.

### 🍽️ 2. Waiter Application (`@frontend/waiter`)
- [ ] **Cancel Order:** Wire up `DELETE /orders/:orderId` in `frontend/waiter/src/redux/features/waiterApi.ts` (soft delete / cancel order).
- [ ] **Staff Attendance Clock-In/Clock-Out:** Wire up `PATCH /shifts/:id/clock-in` and `PATCH /shifts/:id/clock-out` in `frontend/waiter/src/redux/features/waiterApi.ts` to header attendance buttons.
- [ ] **My Shift Schedule:** Wire up `GET /shifts/staff/:staffAssignmentId` in `frontend/waiter/src/redux/features/waiterApi.ts`.

### 🍳 3. Kitchen Application (`@frontend/kitchen`)
- [ ] **Staff Attendance Clock-In/Clock-Out:** Wire up `PATCH /shifts/:id/clock-in` and `PATCH /shifts/:id/clock-out` in `frontend/kitchen/src/redux/features/kitchenApi.ts`.

### 💳 4. Cashier Application (`@frontend/cashier`)
- [ ] **Authoritative Table Bill Calculation:** Wire up `GET /payments/session/:sessionId/bill` in `frontend/cashier/src/redux/features/cashierApi.ts`.
- [ ] **Order Payments Breakdown & Receipts:** Wire up `GET /payments/order/:orderId` and `GET /payments/:id` in `frontend/cashier/src/redux/features/cashierApi.ts` for itemized receipts.
- [x] **Active Table Sessions Monitor:** Implemented in `frontend/cashier/src/redux/features/cashierApi.ts` (`getBranchSessions`).

### 👔 5. Branch Manager Portal (`@frontend/manager`)
- [x] **Menu Category CRUD:** Implemented in `frontend/manager/src/redux/features/branchManagerApi.ts` (`createCategory`, `updateCategory`, `deleteCategory`) & `ManageCategoriesModal.tsx`.
- [x] **Menu Item Deletion:** Implemented in `frontend/manager/src/redux/features/branchManagerApi.ts` (`deleteMenuItem`) & `MenuView.tsx`.
- [x] **Holiday Calendar Management:** Implemented in `frontend/manager/src/redux/features/branchManagerApi.ts` (`getHolidays`, `createHoliday`) & `BranchConfigView.tsx`.
- [x] **Edit Staff Permissions:** Implemented in `frontend/manager/src/redux/features/branchManagerApi.ts` (`updateStaff`) & `StaffDetailView.tsx`.
- [x] **Reservation Management:** Implemented in `frontend/manager/src/redux/features/branchManagerApi.ts` (`getReservations`, `getReservation`, `createReservation`, `updateReservationStatus`, `deleteReservation`) & `TablesView.tsx` (Reservations tab & modals).
- [ ] **Shift Scheduling & Attendance:** Wire up `POST /shifts`, `GET /shifts/:id`, `PATCH /shifts/:id/cancel`, and `DELETE /shifts/:id` in `frontend/manager/src/redux/features/branchManagerApi.ts`.
- [ ] **Quick Base64 Upload:** Wire up `POST /storage/upload/base64` in `frontend/manager/src/redux/features/branchManagerApi.ts`.

### 🛡️ 6. Platform Admin Console (`@frontend/admin`)
- [x] **Organization Creation & Deletion:** Implemented in `frontend/admin/src/redux/features/restaurantApi.ts` (`createOrganization`, `getOrganizationById`, `deleteOrganization`) & `SettingsView.tsx`.
- [x] **Soft Delete User:** Implemented in `frontend/admin/src/redux/features/userApi.ts` (`deleteUser`) & `EmployeesView.tsx`.
- [ ] **Inventory Lookups & Category Update:** Wire up `GET /inventory/suppliers/:id`, `GET /inventory/categories/:id`, and `PATCH /inventory/categories/:id` in `frontend/admin/src/redux/features/inventoryApi.ts`.
- [x] **Dynamic RBAC & Roles Matrix:** Implemented in `frontend/admin/src/redux/features/roleApi.ts` (all 10 endpoints: `getMyCapabilities`, `getPermissions`, `getRoles`, `getRoleById`, `createRole`, `updateRole`, `deleteRole`, `getUserRole`, `assignUserRole`, `removeUserRole`), `usePermission.ts`, `PermissionGate.tsx`, `RequirePermissionPage.tsx`, and wired into `PermissionsView.tsx`, `PermissionsMatrix.tsx`, `RoleOverviewCards.tsx`, `CreateRoleModal.tsx`, `AssignUserRoleModal.tsx`, and `DeleteRoleModal.tsx`.
- [ ] **Platform Broadcast Notifications:** Wire up `POST /notifications` in `frontend/admin/src/redux/api/baseApi.ts`.
- [ ] **Media & S3 File Browser:** Wire up `POST /storage/presigned-upload-url`, `POST /storage/presigned-post`, `POST /storage/presigned-download-url`, `GET /storage/file`, `GET /storage/file/info`, `GET /storage/file/exists`, `GET /storage/files`, `DELETE /storage/file`, and `POST /storage/files/delete-batch` in `frontend/admin/src/redux/features/storageApi.ts`.
- [ ] **Email Diagnostics:** Wire up `POST /mail/test-send`, `POST /mail/test-otp`, and `GET /mail/status` in `frontend/admin/src/app/admin-dashboard/settings/` (Email Diagnostics tab).

### 🔔 7. All Applications Notification Tray
- [ ] **Dismiss Notification:** Wire up `DELETE /notifications/:id` in `frontend/*/src/redux/api/baseApi.ts` to allow users to permanently dismiss a notification item.
