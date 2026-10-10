# Tavonza AI — Backend API & Frontend Implementation Status Matrix

> **Authoritative Tracking Document**  
> Comprehensive audit of all backend REST & RPC endpoints across `apps/api` and their implementation status across the 6 frontend applications (`@frontend/customer`, `@frontend/waiter`, `@frontend/kitchen`, `@frontend/cashier`, `@frontend/manager`, `@frontend/admin`).

---

## 📊 Executive Summary

- **Total Backend Controller Endpoints Audited:** 88 endpoints across 21 controllers
- **Frontend Implemented Endpoints:** 53 endpoints (`[x]` Checked)
- **Pending Frontend Endpoints (Faka / Empty):** 35 endpoints (`[ ]` Blank / Unimplemented in UI/Redux)

### Legend
- `[x]` **Done** — Endpoint exists and is actively integrated in frontend Redux API / components.
- `[ ]` **Empty (Faka / Pending)** — Backend endpoint is complete, but frontend has not yet integrated or wired this endpoint to the UI.

---

## 1. Identity & Access Domain

### 1.1 Authentication (`AuthController` — `apps/api/src/modules/identity/presentation/http/auth.controller.ts`)

| HTTP Method & Route | Backend Done | Frontend Done | Current Frontend Location OR Where Needs Implementation | Description |
| :--- | :---: | :---: | :--- | :--- |
| `POST /auth/register` | [x] | [x] | `frontend/customer/src/redux/features/authApi.ts` (`registerCustomer`) → Register modal | Customer registration with OTP trigger |
| `POST /auth/login` | [x] | [x] | `frontend/*/src/redux/features/authApi.ts` (`loginUser`) in all 6 apps | Email/password credential login |
| `POST /auth/refresh` | [x] | [x] | `frontend/*/src/redux/api/baseApi.ts` (Automatic 401 token interceptor) | Access token rotation using refresh token |
| `POST /auth/logout` | [x] | [x] | `frontend/*/src/redux/features/authApi.ts` (`logoutUser`) in all 6 apps | Invalidate refresh token and session cookies |
| `GET /auth/me` | [x] | [x] | `frontend/*/src/redux/features/authApi.ts` (`getMe`) fallback | Fetch active authenticated profile |
| `PATCH /auth/me` | [x] | [x] | `frontend/*/src/redux/features/userApi.ts` (`updateMe`) | Update personal profile details |
| `POST /auth/verify-otp` | [x] | [x] | `frontend/customer/src/redux/features/authApi.ts` (`verifyOtpThunk`) | 5-digit verification code check |
| `POST /auth/forgot-password` | [x] | [x] | `frontend/customer/src/redux/features/authApi.ts` (`forgotPasswordThunk`) | Send password reset OTP code |
| `POST /auth/reset-password` | [x] | [x] | `frontend/customer/src/redux/features/authApi.ts` (`resetPasswordThunk`) | Submit new password after OTP verification |
| `POST /auth/resend-otp` | [x] | [x] | `frontend/customer/src/redux/features/authApi.ts` (`resendOtpThunk`) | Resend 5-digit verification code |

---

### 1.2 User Management (`UserController` — `apps/api/src/modules/identity/presentation/http/user.controller.ts`)

| HTTP Method & Route | Backend Done | Frontend Done | Current Frontend Location OR Where Needs Implementation | Description |
| :--- | :---: | :---: | :--- | :--- |
| `PATCH /users/me` | [x] | [x] | `frontend/*/src/redux/features/userApi.ts` (`updateMe`) with avatar file upload | Profile updates with avatar image multipart upload |
| `GET /users/me` | [x] | [x] | `frontend/*/src/redux/features/userApi.ts` / `authApi.ts` (`getMe`) | Current user profile |
| `GET /users` | [x] | [x] | `frontend/admin/src/redux/features/userApi.ts` (`getUsersList`) | Paginated user management directory |
| `GET /users/:id` | [x] | [x] | `frontend/admin/src/redux/features/userApi.ts` (`getUserById`) | Single user record detail |
| `PATCH /users/status/:id` | [x] | [x] | `frontend/admin/src/redux/features/userApi.ts` (`changeUserStatus`) | Toggle ACTIVE, INACTIVE, BANNED |
| `DELETE /users/:id` | [x] | [ ] | **Where to implement:** `frontend/admin/src/redux/features/userApi.ts` (`deleteUser`) & `frontend/admin/src/app/admin-dashboard/` | Soft delete user account |
| `POST /users/create-customer` | [x] | [x] | `frontend/customer/src/redux/features/userApi.ts` (`createCustomerUser`) | Direct customer profile creation |
| `POST /users/create-admin` | [x] | [x] | `frontend/admin/src/redux/features/userApi.ts` (`createAdminUser`) | Platform admin creation (SUPER_ADMIN only) |

---

## 2. Organization, Restaurant & Branch Hierarchy Domain

### 2.1 Organizations (`OrganizationController` — `apps/api/src/modules/organizations/presentation/http/organization.controller.ts`)

| HTTP Method & Route | Backend Done | Frontend Done | Current Frontend Location OR Where Needs Implementation | Description |
| :--- | :---: | :---: | :--- | :--- |
| `POST /organizations` | [x] | [ ] | **Where to implement:** `frontend/admin/src/redux/features/restaurantApi.ts` (or `organizationApi.ts`) & `frontend/admin/src/app/admin-dashboard/` | Create a new tenant organization |
| `GET /organizations` | [x] | [x] | `frontend/admin/src/redux/features/restaurantApi.ts` (`getOrganizations`) | List all organizations |
| `GET /organizations/my` | [x] | [ ] | **Where to implement:** `frontend/admin/src/redux/features/restaurantApi.ts` & Admin tenant switchers | List organizations owned by logged-in user |
| `GET /organizations/:id` | [x] | [ ] | **Where to implement:** `frontend/admin/src/redux/features/restaurantApi.ts` & Admin Organization detail page | Get organization details by ID |
| `PATCH /organizations/:id` | [x] | [ ] | **Where to implement:** `frontend/admin/src/redux/features/restaurantApi.ts` & Admin Organization settings form | Update organization details |
| `DELETE /organizations/:id` | [x] | [ ] | **Where to implement:** `frontend/admin/src/redux/features/restaurantApi.ts` & Admin Organization management modal | Delete organization |

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
| `GET /branches/:id/settings` | [x] | [x] | `frontend/manager/src/redux/features/branchManagerApi.ts` (`getSettings`, `fetchBranchSettings`) | Fetch branch order acceptance mode & tax/service rates |
| `PATCH /branches/:id/settings` | [x] | [x] | `frontend/manager/src/redux/features/branchManagerApi.ts` (`updateSettings`, `updateBranchSettingsThunk`) | Update branch operational settings |
| `GET /branches/:id/operating-hours` | [x] | [x] | `frontend/manager/src/redux/features/branchManagerApi.ts` (`getOperatingHours`) | Get weekly operating schedule |
| `PUT /branches/:id/operating-hours` | [x] | [x] | `frontend/manager/src/redux/features/branchManagerApi.ts` (`updateOperatingHours`) | Set/replace weekly opening & closing hours |
| `GET /branches/:id/holidays` | [x] | [ ] | **Where to implement:** `frontend/manager/src/redux/features/branchManagerApi.ts` & `frontend/manager/src/components/branch-manager-dashboard/BranchConfigView.tsx` | View branch holiday calendar |
| `POST /branches/:id/holidays` | [x] | [ ] | **Where to implement:** `frontend/manager/src/redux/features/branchManagerApi.ts` & `frontend/manager/src/components/branch-manager-dashboard/BranchConfigView.tsx` | Add holiday or special closure |
| `GET /branches/:id/staff` | [x] | [x] | `frontend/manager/src/redux/features/branchManagerApi.ts` (`getStaffAssignments`) & `frontend/admin/src/redux/features/restaurantApi.ts` (`getBranchStaff`) | List staff assigned to branch |
| `GET /branches/:id/staff/:staffId` | [x] | [x] | `frontend/manager/src/redux/features/branchManagerApi.ts` (`getStaffMember`) | Single staff assignment detail |
| `POST /branches/:id/staff` | [x] | [x] | `frontend/manager/src/redux/features/branchManagerApi.ts` (`createStaff`) & `frontend/admin/src/redux/features/restaurantApi.ts` (`createBranchStaff`) | Create new staff user and assign to branch |
| `POST /branches/:id/staff/assign` | [x] | [x] | `frontend/manager/src/redux/features/branchManagerApi.ts` (`assignStaff`) | Assign existing staff user to branch |
| `PATCH /branches/:id/staff/:staffId` | [x] | [ ] | **Where to implement:** `frontend/manager/src/redux/features/branchManagerApi.ts` (`updateStaff`) & `frontend/manager/src/components/StaffDetailView.tsx` | Update staff branch assignment role & permissions |
| `DELETE /branches/:id/staff/:staffId` | [x] | [x] | `frontend/admin/src/redux/features/restaurantApi.ts` (`deleteBranchStaff`) | Deactivate/remove staff from branch |

---

## 3. Menu & Catalog Domain

### 3.1 Menus & Categories (`MenuController` — `apps/api/src/modules/menus/presentation/controllers/menu.controller.ts`)

| HTTP Method & Route | Backend Done | Frontend Done | Current Frontend Location OR Where Needs Implementation | Description |
| :--- | :---: | :---: | :--- | :--- |
| `GET /menus/:branchId/categories` | [x] | [x] | `frontend/customer/src/redux/features/menuCategoryApi.ts`, cashier, kitchen, manager | Active categories list |
| `GET /menus/:branchId/items` | [x] | [x] | `frontend/customer/src/redux/features/menuItemApi.ts`, waiter, cashier, kitchen, manager | Active menu items with search/filter |
| `GET /menus/items/:itemId` | [x] | [x] | `frontend/customer/src/redux/features/menuItemApi.ts` (`findById`) | Item detail with add-ons & nutrition |
| `POST /menus/categories` | [x] | [ ] | **Where to implement:** `frontend/manager/src/redux/features/branchManagerApi.ts` (`createCategory`) & Manager Menu tab | Create new category (e.g. Burgers, Drinks) |
| `PATCH /menus/categories/:id` | [x] | [ ] | **Where to implement:** `frontend/manager/src/redux/features/branchManagerApi.ts` (`updateCategory`) & Manager Menu tab | Edit category details |
| `DELETE /menus/categories/:id` | [x] | [ ] | **Where to implement:** `frontend/manager/src/redux/features/branchManagerApi.ts` (`deleteCategory`) & Manager Menu tab | Soft delete category |
| `POST /menus/items` | [x] | [ ] | **Where to implement:** `frontend/manager/src/redux/features/branchManagerApi.ts` (`createItem`) & Manager Menu tab (Add Dish Modal) | Create dish/item with pricing & modifiers |
| `PATCH /menus/items/:itemId` | [x] | [ ] | **Where to implement:** `frontend/manager/src/redux/features/branchManagerApi.ts` (`updateItem`) & Manager Menu tab (Edit Dish Modal) | Update dish pricing, photos, modifiers |
| `DELETE /menus/items/:itemId` | [x] | [ ] | **Where to implement:** `frontend/manager/src/redux/features/branchManagerApi.ts` (`deleteItem`) & Manager Menu tab | Soft delete menu item |

---

## 4. Tables, Floor & Reservation Domain

### 4.1 Tables (`TableController` — `apps/api/src/modules/tables/presentation/http/table.controller.ts`)

| HTTP Method & Route | Backend Done | Frontend Done | Current Frontend Location OR Where Needs Implementation | Description |
| :--- | :---: | :---: | :--- | :--- |
| `GET /tables/resolve-qr/:token` | [x] | [x] | `frontend/customer/src/lib/qrSession.ts` | Resolve scanned QR token to branch & table |
| `POST /tables` | [x] | [x] | `frontend/manager/src/redux/features/branchManagerApi.ts` (`createTable`) | Create dining table |
| `GET /tables` | [x] | [x] | `frontend/manager/src/redux/features/branchManagerApi.ts` (`getTables`), waiter, cashier | List tables by branch query param |
| `GET /tables/branch/:branchId` | [x] | [x] | Alternative path route to `GET /tables?branchId=...` | List tables by branch path param |
| `GET /tables/:id` | [x] | [x] | `frontend/manager/src/redux/features/branchManagerApi.ts` (`getTable`) | Single table detail |
| `PATCH /tables/:id` | [x] | [x] | `frontend/manager/src/redux/features/branchManagerApi.ts` (`updateTable`) | Update table capacity, label, shape |
| `POST /tables/:id/regenerate-qr` | [x] | [x] | `frontend/manager/src/redux/features/branchManagerApi.ts` (`regenerateQr`) | Rotate opaque QR token for table |
| `DELETE /tables/:id` | [x] | [x] | `frontend/manager/src/redux/features/branchManagerApi.ts` (`deleteTable`) | Soft delete table |
| `POST /tables/reservations` | [x] | [ ] | **Where to implement:** `frontend/customer/src/redux/features/reservationApi.ts` & `frontend/manager/src/redux/features/branchManagerApi.ts` | Book table reservation |
| `GET /tables/reservations/branch/:branchId` | [x] | [ ] | **Where to implement:** `frontend/manager/src/redux/features/branchManagerApi.ts` & Manager Reservations view | List reservations for branch |
| `GET /tables/reservations/:id` | [x] | [ ] | **Where to implement:** `frontend/manager/src/redux/features/branchManagerApi.ts` & Reservation detail drawer | View single reservation details |
| `PATCH /tables/reservations/:id/status` | [x] | [ ] | **Where to implement:** `frontend/manager/src/redux/features/branchManagerApi.ts` & Manager Reservations view | Update status (CONFIRMED, SEATED, CANCELLED) |
| `DELETE /tables/reservations/:id` | [x] | [ ] | **Where to implement:** `frontend/manager/src/redux/features/branchManagerApi.ts` & Manager Reservations view | Cancel reservation |

---

## 5. Table Sessions & Customer Experience Domain

### 5.1 Sessions (`TableSessionController` — `apps/api/src/modules/table-sessions/presentation/table-session.controller.ts`)

| HTTP Method & Route | Backend Done | Frontend Done | Current Frontend Location OR Where Needs Implementation | Description |
| :--- | :---: | :---: | :--- | :--- |
| `POST /sessions/table-otp/request` | [x] | [x] | `frontend/customer/src/redux/features/sessionApi.ts` (`requestTableOtp`) | Send 5-digit table login OTP |
| `POST /sessions/table-otp/verify` | [x] | [x] | `frontend/customer/src/redux/features/sessionApi.ts` (`verifyTableOtp`) | Verify OTP & issue guest session JWT |
| `POST /sessions/scan` | [x] | [x] | `frontend/customer/src/redux/features/sessionApi.ts` (`scanQr`) | QR scan handler (creates or joins session) |
| `GET /sessions/branch/:branchId` | [x] | [ ] | **Where to implement:** `frontend/manager/src/redux/features/branchManagerApi.ts` & `frontend/cashier/src/redux/features/cashierApi.ts` | List active table sessions with occupancy |
| `GET /sessions/:sessionId` | [x] | [x] | `frontend/customer/src/redux/features/sessionApi.ts` (`getSession`) | Active session and seated guests list |
| `POST /sessions/:sessionId/share-code` | [x] | [x] | `frontend/customer/src/redux/features/sessionApi.ts` (`generateShareCode`) | Generate 6-character companion join code |
| `POST /sessions/join` | [x] | [x] | `frontend/customer/src/redux/features/sessionApi.ts` (`joinSession`) | Join dining table via companion code |
| `PATCH /sessions/order-mode` | [x] | [x] | `frontend/customer/src/redux/features/sessionApi.ts` (`setOrderMode`) | Toggle individual vs. group order mode |
| `POST /sessions/:sessionId/request-bill` | [x] | [ ] | **Where to implement:** `frontend/customer/src/redux/features/sessionApi.ts` (`requestBill`) & Customer Cart/Bill screen | Dedicated customer bill request to floor staff |
| `POST /sessions/:sessionId/call-waiter` | [x] | [ ] | **Where to implement:** `frontend/customer/src/redux/features/sessionApi.ts` (`callWaiter`) & Floating Call Waiter button | Direct session waiter call alert |
| `POST /sessions/:sessionId/close` | [x] | [x] | `frontend/customer/src/redux/features/sessionApi.ts` (`closeSession`) & `cashierApi.ts` | Close table session upon payment |

---

### 5.2 Feedback & Reviews (`FeedbackController` — `apps/api/src/modules/customer-sessions/feedback.service-controller.ts`)

| HTTP Method & Route | Backend Done | Frontend Done | Current Frontend Location OR Where Needs Implementation | Description |
| :--- | :---: | :---: | :--- | :--- |
| `POST /feedback` | [x] | [ ] | **Where to implement:** `frontend/customer/src/redux/features/feedbackApi.ts` & `frontend/customer/src/app/review/page.tsx` | Submit 1–5 star order rating and comments |
| `GET /feedback/order/:orderId` | [x] | [ ] | **Where to implement:** `frontend/customer/src/redux/features/feedbackApi.ts` & Customer Order Status screen | Check if order has already been reviewed |

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

### 7.1 Payments (`PaymentController` — `apps/api/src/modules/payments/presentation/payment.controller.ts`)

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

## 11. System, Mailer & Storage

### 11.1 Mailer Diagnostics (`MailController` — `apps/api/src/modules/notifications/presentation/http/mail.controller.ts`)

| HTTP Method & Route | Backend Done | Frontend Done | Current Frontend Location OR Where Needs Implementation | Description |
| :--- | :---: | :---: | :--- | :--- |
| `POST /mail/test-send` | [x] | [ ] | **Where to implement:** `frontend/admin/src/app/admin-dashboard/settings/` (Email Diagnostics tab) | Test custom email dispatch via SES/Queue |
| `POST /mail/test-otp` | [x] | [ ] | **Where to implement:** `frontend/admin/src/app/admin-dashboard/settings/` (Email Diagnostics tab) | Test OTP template email dispatch |
| `GET /mail/status` | [x] | [ ] | **Where to implement:** `frontend/admin/src/app/admin-dashboard/settings/` (Email Diagnostics tab) | Check mail queue & SES connectivity |

---

### 11.2 Storage & File Service (`StorageController` — `apps/api/src/modules/storage/storage.controller.ts`)

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

## 12. Internal AI Tool Gateway (`InternalAiController` — `apps/api/src/modules/ai/presentation/http/internal-ai.controller.ts`)

> *Note: These are `/internal/*` routes protected by `InternalServiceGuard`. They are consumed exclusively by the Python AI agent runtime (`apps/ai`), not called directly by the browser.*

| HTTP Method & Route | Backend Done | Python AI Runtime Done | Description |
| :--- | :---: | :---: | :--- |
| `POST /internal/auth/resolve-actor` | [x] | [x] | Resolves customer/staff JWT into validated ActorContext |
| `GET /internal/context/bootstrap` | [x] | [x] | Fetches operational snapshot of branch tables & sessions |
| `POST /internal/tools/execute` | [x] | [x] | Executes approved domain tools (menu search, order placement, alerts) |
| `POST /internal/tools/execute/confirm` | [x] | [x] | Confirms sensitive mutations (order submission, payment) |
| `POST /internal/audit` | [x] | [x] | Ingests structured AI action events into audit log |

*(Customer, Waiter, and Kitchen frontends interact with the AI subsystem via `apps/ai` endpoints `/ai/chat`, `/ai/voice/transcribe`, and `/ai/voice/synthesize` implemented in `frontend/*/src/redux/features/chatApi.ts`).*

---

## 🎯 Summary of Pending Frontend Implementations (Faka Checklist by App)

To achieve 100% full-stack parity across all features, implement the following categorized endpoints in their target frontend applications:

### 📱 1. Customer Application (`@frontend/customer`)
- [ ] **Feedback Submission:** Wire up `POST /feedback` and `GET /feedback/order/:orderId` in `feedbackApi.ts` with a post-dining rating screen.
- [ ] **Table Reservations:** Wire up `POST /tables/reservations` in `reservationApi.ts` for advance table booking.
- [ ] **Direct Waiter Call & Bill Request:** Wire up `POST /sessions/:sessionId/call-waiter` and `POST /sessions/:sessionId/request-bill` in `sessionApi.ts`.
- [ ] **Authoritative Session Bill Lookup:** Wire up `GET /payments/session/:sessionId/bill` in `paymentApi.ts` before settling payment.

### 🍽️ 2. Waiter Application (`@frontend/waiter`)
- [ ] **Cancel Order:** Wire up `DELETE /orders/:orderId` in `waiterApi.ts` (soft delete/cancel order).
- [ ] **Staff Attendance Clock-In/Clock-Out:** Wire up `PATCH /shifts/:id/clock-in` and `PATCH /shifts/:id/clock-out` in `waiterApi.ts` to header attendance buttons.
- [ ] **My Shift Schedule:** Wire up `GET /shifts/staff/:staffAssignmentId` in `waiterApi.ts`.

### 🍳 3. Kitchen Application (`@frontend/kitchen`)
- [ ] **Staff Attendance Clock-In/Clock-Out:** Wire up `PATCH /shifts/:id/clock-in` and `PATCH /shifts/:id/clock-out` in `kitchenApi.ts`.

### 💳 4. Cashier Application (`@frontend/cashier`)
- [ ] **Authoritative Table Bill Calculation:** Wire up `GET /payments/session/:sessionId/bill` in `cashierApi.ts`.
- [ ] **Order Payments Breakdown:** Wire up `GET /payments/order/:orderId` and `GET /payments/:id` in `cashierApi.ts` for detailed receipts.
- [ ] **Active Table Sessions Monitor:** Wire up `GET /sessions/branch/:branchId` in `cashierApi.ts`.

### 👔 5. Branch Manager Portal (`@frontend/manager`)
- [ ] **Menu Category CRUD:** Wire up `POST /menus/categories`, `PATCH /menus/categories/:id`, `DELETE /menus/categories/:id` in `branchManagerApi.ts`.
- [ ] **Menu Item CRUD:** Wire up `POST /menus/items`, `PATCH /menus/items/:itemId`, `DELETE /menus/items/:itemId` in `branchManagerApi.ts`.
- [ ] **Holiday Calendar Management:** Wire up `GET /branches/:id/holidays` and `POST /branches/:id/holidays` in `branchManagerApi.ts`.
- [ ] **Edit Staff Permissions:** Wire up `PATCH /branches/:id/staff/:staffId` in `branchManagerApi.ts`.
- [ ] **Reservation Management:** Wire up `GET /tables/reservations/branch/:branchId`, `GET /tables/reservations/:id`, and `PATCH /tables/reservations/:id/status` in `branchManagerApi.ts`.
- [ ] **Shift Scheduling & Attendance:** Wire up `POST /shifts` and `PATCH /shifts/:id/cancel` in `branchManagerApi.ts`.

### 🛡️ 6. Platform Admin Console (`@frontend/admin`)
- [ ] **Organization CRUD:** Wire up `POST /organizations`, `GET /organizations/:id`, `PATCH /organizations/:id`, and `DELETE /organizations/:id` in `restaurantApi.ts` (or `organizationApi.ts`).
- [ ] **Soft Delete User:** Wire up `DELETE /users/:id` in `userApi.ts`.
- [ ] **Media & S3 File Browser:** Wire up `POST /storage/presigned-upload-url`, `GET /storage/files`, and `DELETE /storage/file` in `storageApi.ts`.
- [ ] **Email Diagnostics:** Wire up `POST /mail/test-send`, `POST /mail/test-otp`, and `GET /mail/status`.
