# Phase A — Appwrite Setup Checklist

This setup is required before Phase A features can run without runtime errors.

## Required Collections

### 1) `chat_sessions` (new)
Create collection ID: `chat_sessions`

Attributes:
- `ideaId` — string(255), required
- `ideaVersionId` — string(255), required
- `title` — string(255), required
- `messageCount` — integer, required
- `lastMessageAt` — string(50), required

### 2) `chat_messages` (new)
Create collection ID: `chat_messages`

Attributes:
- `sessionId` — string(255), required
- `ideaId` — string(255), required
- `ideaVersionId` — string(255), required
- `role` — string(20), required
- `content` — string(50000), required
- `toolCalls` — string(50000), optional
- `toolResults` — string(50000), optional
- `createdAt` — string(50), required

## Required Attribute Additions

### 3) `mvp_plans` (existing)
Add attribute:
- `featureStatuses` — string(10000), optional

### 4) `evaluations` (existing)
Add attribute:
- `competitorProfiles` — string(50000), optional

## Why the errors happened

- `Unknown attribute: "featureStatuses"`
  - `mvp_plans` is missing the new `featureStatuses` attribute.

- `Collection with requested ID 'chat_sessions' could not be found`
  - The `chat_sessions` collection has not been created yet.

## Validation after setup

1. Open an idea and go to MVP tab.
2. Toggle a checkbox and refresh; status should persist.
3. Open AI Assistant tab; session should create and load.
4. Send a message; response should stream and persist.
