# FindBuddy — MVP & Business Requirements Document (BRD)

**Product Name:** FindBuddy  
**Business Entity:** The Logic Machines  
**Document Type:** MVP + BRD  
**Version:** 1.0

---

# 1. Product Overview

FindBuddy is a social buddy marketplace where a user can:

- Find and book a buddy for an activity or purpose.
- Offer their own buddy services.
- Set their own pricing for offered services.
- Create or join individual or group plans.
- Build a Trust Score through verified activity, ratings, repeat bookings, and platform verification.
- Upgrade to a paid membership for additional verification, visibility, trust, and safety benefits.

A single user can both **offer services** and **book services** using the same account.

---

# 2. Core Product Concept

The platform will have two user experiences:

## 2.1 Free User

A free user can:

- Create an account.
- Complete profile details optionally.
- Upload profile photo.
- Select interests and languages.
- Offer services.
- Book services from other users.
- Set their own service pricing up to **₹500 per service/session**.
- Free users cannot list services on a **per-hour pricing model**.
- Create plans.
- Join plans.
- Create or join group plans.
- Send and receive booking requests.
- Chat after a relevant connection/request.
- Rate and review completed bookings.
- Build a basic Trust Score through platform activity.

## 2.2 Paid User — ₹299/month

Paid members receive all Free User functionality plus:

- Aadhaar-based identity verification.
- Verified badge.
- Ability to list services using **per-hour pricing**.
- Ability to set pricing above the Free User ₹500/service limit.
- Better profile visibility.
- Advanced filters.
- Priority booking/request visibility.
- Detailed Trust Score.
- Verified-only matching/filtering.
- Additional women-safety options.
- Priority support.

**Subscription Price:** ₹299/month

---

# 3. User Roles

## 3.1 User

Standard free account.

The same user can:

- Offer buddy services.
- Book another buddy.
- Create plans.
- Join plans.

## 3.2 Pro User

A user with an active ₹299/month subscription.

Receives paid membership benefits and can complete Aadhaar verification for the Verified badge.

## 3.3 Admin

Admin can:

- Manage users.
- Review verification requests.
- Manage services/categories.
- Review bookings.
- Review reports and complaints.
- Adjust Trust Score when required.
- Moderate profiles, plans, reviews, and listings.
- Admin management.
- Platform settings.
- Subscription configuration.
- Service/category management.
- Trust Score rules.
- User suspension/blocking.
- Full reporting and moderation access.

# 4. MVP Features

## 4.1 Authentication & Onboarding

Users can register/login using:

- Email

Profile information:

- Profile photo
- Name
- Age
- Gender
- City
- Pincode
- Bio
- Interests
- Languages
- User intention:
  - I want to offer services
  - I want to book services
  - Both

Most detailed profile fields can remain optional during onboarding.

---

# 5. Buddy Services

Users can offer or book services.

Initial service examples:

- Gym Buddy
- Club Buddy
- Coffee Buddy
- Movie Partner
- Travel Buddy
- Only Listening
- Shopping Buddy
- Gaming Buddy
- Event Buddy
- Custom Service

A provider can define their own pricing.

Pricing examples:

- ₹300/hour
- ₹500/session
- ₹800/movie
- Free

### Free User Pricing Rule

- A Free User can list a paid service for a maximum of **₹500 per service/session**.
- A Free User cannot use **per-hour pricing**.

### Paid User Pricing Rule

- A Paid User can use **per-hour pricing**.
- A Paid User can set pricing above the Free User ₹500/service limit.
- A Paid User can also offer a service per session or for free. 
---

# 6. Service Listing

For each service, the provider can define:

- Service category
- Service title
- Description
- Price
- Pricing type
  - Per hour — Paid Users only
  - Per session
  - Free
- Availability
- City/location

Users can browse available buddy services and send booking requests.

---

# 7. Plans & Group Plans

Users can create plans independent of regular service listings.

Examples:

- Movie tonight
- Saturday house party
- Sunday football
- Coffee meetup
- Club plan
- Group trip

A plan can contain:

- Plan title
- Description
- Date
- Time
- Location
- Number of people required
- Free or paid
- Price, if applicable

Other users can request to join the plan.

The creator can accept or reject join requests.

---

# 8. Booking Flow

Basic booking flow:

1. User opens another user's profile/service.
2. User selects service.
3. User selects date/time.
4. User sends booking request.
5. Provider accepts or rejects.
6. Booking becomes confirmed.
7. Users can communicate regarding the confirmed booking.
8. Booking is marked completed.
9. Both parties can rate/review the experience.

---

# 9. Ratings & Reviews

After a completed booking:

Users can rate each other based on:

- Overall experience
- Behaviour/respect
- Punctuality
- Profile accuracy
- Whether they would book/meet again

Ratings contribute to the Trust Score.

---

# 10. Trust Score

Every user will have a Trust Score.

Example:

**Trust Score: 82/100**

Trust Score is intended to show how trustworthy a user appears based on their platform history.

## 10.1 Trust Score Factors

Trust Score can increase through:

- Successful completed bookings
- Positive ratings
- Repeat bookings
- Profile verification
- Aadhaar verification
- Good booking history
- Low cancellation rate
- Positive platform behaviour

Trust Score can decrease through:

- Frequent cancellations
- Poor ratings
- Confirmed complaints
- Safety reports
- Suspicious platform activity

## 10.2 Repeat Booking Impact

If the same user is repeatedly booked by users and receives positive ratings, their Trust Score should increase.

Repeat customers are considered a positive trust signal.

## 10.3 Admin Trust Score Control

Admin can manually increase or decrease a Trust Score when required.

Every manual adjustment must contain a reason.

Examples:

- Aadhaar manually verified
- Verification completed
- Confirmed complaint
- Suspicious activity
- Strong booking history

Trust Score will **not be directly purchasable**.

Paid membership can provide verification opportunities and additional trust information, but the Trust Score itself must reflect real platform activity and verification.

---

# 11. Booking Recommendation System

The system will help users decide whether they should book someone.

Possible recommendation states:

- Recommended
- Proceed with Caution
- Not Recommended

The recommendation can use:

- Trust Score
- Verification status
- Ratings
- Number of completed bookings
- Repeat bookings
- Cancellation history
- Reports/complaints

Example:

> Recommended  
> Aadhaar Verified • Trust Score 91 • 18 completed bookings • 6 repeat bookings

Example:

> Proceed with Caution  
> New profile • No completed bookings • Not verified

The exact scoring algorithm can be finalized during development.

---

# 12. Aadhaar Verification

Aadhaar verification will be available as part of the paid membership experience.

After successful verification:

- User receives a Verified badge.
- Verification status contributes positively to Trust Score.
- Other users can identify the account as verified.

The platform should only expose the verification status/badge publicly, not Aadhaar details.

---

# 13. Women Safety

Women-safety features are part of the MVP.

Features:

- Verified-only matching/filter
- Women-only visibility option
- Block user
- Report user
- SOS option
- Trusted contact
- Meetup check-in
- Meetup check-out
- Public-place suggestion for first meetings

---

# 14. Search & Discovery

Users should be able to discover buddies based on:

- Service category
- City/location
- Price
- Rating
- Verification status
- Trust Score
- Availability

Paid users can receive access to advanced filters.

---

# 15. Chat

Users can communicate through platform chat when there is a relevant connection such as:

- Booking request
- Accepted booking
- Plan/join request

The purpose is to coordinate the activity or booking.

---

# 16. Payments

The platform must support:

- Paid buddy services
- Free buddy services
- ₹299/month subscription
- Paid group plans where applicable

Payment details and booking payment status must be stored with the relevant booking or plan.

---

# 17. Subscription

## FindBuddy Pro

**Price:** ₹299/month

Benefits:

- All Free User features
- Per-hour service pricing
- Ability to set pricing above the Free User ₹500/service limit
- Aadhaar verification eligibility
- Verified badge
- Better profile visibility
- Advanced filters
- Priority requests
- Detailed Trust Score
- Verified-only matching
- Additional safety options
- Priority support

Subscription status should be visible in the user's account.

---

# 18. Notifications

Users should receive notifications for:

- New booking request
- Booking accepted
- Booking rejected
- Plan join request
- Join request accepted/rejected
- New chat message
- Booking reminder
- Rating/review request
- Verification status
- Subscription status

---

# 19. Admin Dashboard

The Admin Dashboard should provide management for:

## Users

- View users
- View profile
- View verification status
- View Trust Score
- Suspend/block user

## Verification

- Review Aadhaar verification status
- Approve/reject verification
- Assign/remove Verified badge

## Services

- View services
- Manage service categories
- Remove inappropriate listings

## Plans

- View plans
- Review reported plans
- Remove inappropriate plans

## Bookings

- View bookings
- View booking status
- View cancellation history

## Trust Score

- View score
- View score factors/history
- Increase/decrease score manually
- Require reason for every manual adjustment

## Safety & Reports

- Review reports
- Review complaints
- Take moderation action
- Suspend/block accounts where required

## Subscription

- View active/inactive subscriptions
- View subscription status

---

# 20. Core MVP Modules

The MVP consists of the following modules:

1. Authentication
2. User Profile
3. Free/Pro Membership (₹500/service Free limit and per-hour Paid pricing)
4. Aadhaar Verification
5. Services
6. Search & Discovery
7. Plans & Group Plans
8. Booking
9. Chat
10. Payments
11. Subscription
12. Ratings & Reviews
13. Trust Score
14. Booking Recommendation System
15. Women Safety
16. Reports & Blocking
17. Notifications
18. Admin Dashboard

---

# 21. Main User Flow

## User Offering a Service

```text
Signup
→ Create Profile
→ Select "Offer Services"
→ Add Service
→ Set Price
→ Publish
→ Receive Booking Request
→ Accept/Reject
→ Complete Booking
→ Receive Rating
→ Trust Score Updated
```

## User Booking a Buddy

```text
Signup
→ Search Service/Buddy
→ View Profile
→ Check Verification + Trust Score
→ System Recommendation
→ Select Service
→ Send Booking Request
→ Booking Accepted
→ Complete Activity
→ Rate Buddy
```

## Plan Flow

```text
Create Plan
→ Add Date/Time/Location
→ Set Free/Paid
→ Publish
→ Users Request to Join
→ Creator Accepts/Rejects
→ Plan Takes Place
```

## Pro Membership Flow

```text
Free User
→ Upgrade to FindBuddy Pro
→ Pay ₹299/month
→ Complete Aadhaar Verification
→ Verified Badge
→ Pro Benefits Activated
```

---

# 22. Platform Role & Disclaimer

FindBuddy acts as a **technology and intermediary platform** that helps users discover, connect with, book, or join other users for services, activities, and plans.

- FindBuddy itself does not personally provide the buddy service or activity offered by users.
- Users independently decide whom to contact, book, meet, accept, or join.
- Users are responsible for their own conduct, decisions, interactions, meetings, and compliance with applicable laws.
- A Verified badge, Trust Score, rating, review, or system recommendation is only a platform-generated trust/safety indicator and **does not guarantee** a user's identity, behaviour, safety, service quality, or future conduct.
- Users should use their own judgment and follow the platform's safety features before and during any meeting.
- FindBuddy may review reports, moderate content, adjust Trust Scores, suspend accounts, or take other platform actions where required.
- To the extent permitted by applicable law, FindBuddy will not be responsible for personal disputes, misconduct, loss, injury, or incidents arising from direct interactions between users outside the platform's role as an intermediary.

This BRD describes the product requirement only. The final application should display the applicable Terms & Conditions, Privacy Policy, Safety Policy, and other legal notices separately.

---

# 23. MVP Goal

The MVP should prove whether users are willing to:

- Offer their time as a buddy.
- Pay or participate in buddy-based activities.
- Find buddies for specific activities.
- Create and join social/group plans.
- Use ratings, verification, and Trust Score to decide whom to meet.
- Pay ₹299/month for additional verification, visibility, trust, and safety benefits.

---

# 24. MVP Scope Summary

FindBuddy MVP will focus on four core actions:

**Find a Buddy**  
**Become a Buddy**  
**Create/Join a Plan**  
**Build Trust**

The product should remain focused on these actions during the MVP stage.
