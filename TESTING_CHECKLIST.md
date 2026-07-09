# 📋 Task 799 - Final Testing Checklist

This checklist covers all critical workflows and API integrations for the BidMaster MERN Auction Platform. Use this before deploying to production.

## 1. Notification API Testing

### ✅ Notification Creation
- [ ] Ensure a notification is created for the **Seller** when a bid is placed.
- [ ] Ensure a notification is created for the **Previous Highest Bidder** (Outbid Alert) when a new bid is placed.
- [ ] Ensure a notification is created for the **Winner** when an auction automatically closes.
- [ ] Ensure a notification is created for the **Seller** when an auction automatically closes.

### ✅ Notification Retrieval
- [ ] `GET /api/notifications` successfully returns only the logged-in user's notifications.
- [ ] Notifications are sorted by newest first (`-createdAt`).
- [ ] Auction data (`title`, `image`) is properly populated in the notification response.

### ✅ Mark as Read
- [ ] `PUT /api/notifications/:id/read` successfully changes `isRead` to `true`.
- [ ] `PUT /api/notifications/read-all` successfully updates all unread notifications for the user to `true`.

### ✅ Invalid User Handling
- [ ] Ensure unauthorized users attempting to access `GET /api/notifications` receive a `401 Unauthorized` error.
- [ ] Ensure a user attempting to mark someone else's notification as read receives a `403 Forbidden` error.

---

## 2. Admin Reports API Testing

### ✅ Reports Generation
- [ ] `GET /api/admin/reports` correctly calculates total users, buyers, sellers, and admins.
- [ ] Total Auctions, Active Auctions, and Closed Auctions are accurately counted.
- [ ] Total Revenue calculates correctly (e.g., 5% of closed auction values).

### ✅ Monthly Data Generation
- [ ] `GET /api/admin/reports/monthly` returns an array of 12 objects (Jan-Dec).
- [ ] User registrations and auction creations are properly grouped by month using MongoDB Aggregation.

### ✅ Security & Empty Data
- [ ] Ensure non-admin users (Buyers, Sellers) receive a `403 Forbidden` when accessing `/api/admin/*`.
- [ ] Ensure the system handles empty databases gracefully (returns 0 instead of crashing or returning `null`).

---

## 3. Frontend Integration Testing

### ✅ Login & Registration Flow
- [ ] Users can successfully register as a `Buyer` or `Seller`.
- [ ] Form validation prevents empty submissions or weak passwords.
- [ ] Incorrect credentials show a clear error message (not a console error).
- [ ] JWT Token is properly stored in `localStorage` and attached to future requests.

### ✅ Auction Flow
- [ ] **Seller Dashboard**: Seller can create an auction with a future end date and start price.
- [ ] **Explore Page**: All active auctions display correctly. Search functionality filters by title.
- [ ] **Auction Details**:
  - [ ] Start price, current price, and time remaining are visible.
  - [ ] Logged-in buyer can place a bid greater than the current price.
  - [ ] Form blocks bids lower than the current price.
  - [ ] Bid history updates immediately after a successful bid.
  - [ ] Seller cannot bid on their own auction.

### ✅ Notification Flow
- [ ] Notification bell icon shows a badge when there are unread notifications.
- [ ] Clicking "Mark all read" updates the UI instantly without requiring a page reload.
- [ ] Notifications link directly back to the relevant auction details page.

### ✅ Admin Report Flow
- [ ] **Admin Dashboard**: Only visible to users with the `admin` role.
- [ ] **Admin Reports**: Recharts graphs render correctly without console warnings.
- [ ] Stats cards populate with accurate data from the backend.

---

## 4. Error Handling Verification

- [ ] **400 Bad Request**: Triggered on invalid Mongoose CastErrors (e.g., bad ObjectIDs) or duplicate keys (e.g., registering an existing email).
- [ ] **401 Unauthorized**: Triggered on expired JWT tokens or missing headers.
- [ ] **403 Forbidden**: Triggered when a User tries to create an auction, or a Seller tries to view Admin reports.
- [ ] **404 Not Found**: Triggered for non-existent API routes or fetching deleted auctions.
- [ ] **500 Internal Error**: Properly formatted JSON response, hiding stack traces in production (`NODE_ENV=production`).
