# Pricing System Database Structure

## Overview
The pricing system uses a three-table relational structure to support full CRUD operations for tabs, plans, and features.

## Database Tables

### 1. pricing_tabs
Stores the device category tabs (e.g., "1 Device", "2 Devices", "3 Devices")

```sql
CREATE TABLE pricing_tabs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  display_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_display_order (display_order)
)
```

**Fields:**
- `id`: Unique identifier for the tab
- `name`: Display name (e.g., "1 Device", "2 Devices")
- `display_order`: Order in which tabs appear (1, 2, 3...)
- `created_at`: Timestamp of creation
- `updated_at`: Timestamp of last update

### 2. plans
Stores individual pricing plans within each tab

```sql
CREATE TABLE plans (
  id INT PRIMARY KEY AUTO_INCREMENT,
  tab_id INT NOT NULL,
  title VARCHAR(100) NOT NULL,
  price VARCHAR(50) NOT NULL,
  is_popular TINYINT(1) DEFAULT 0,
  use_whatsapp TINYINT(1) DEFAULT 0,
  checkout_link TEXT,
  display_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (tab_id) REFERENCES pricing_tabs(id) ON DELETE CASCADE ON UPDATE CASCADE,
  INDEX idx_tab_id (tab_id),
  INDEX idx_display_order (display_order)
)
```

**Fields:**
- `id`: Unique identifier for the plan
- `tab_id`: Foreign key to pricing_tabs (CASCADE DELETE)
- `title`: Plan duration (e.g., "1 Month", "3 Months")
- `price`: Formatted price string (e.g., "$9.99")
- `is_popular`: Boolean flag for "Most Popular" badge
- `use_whatsapp`: Boolean flag to show WhatsApp button instead of checkout link
- `checkout_link`: URL for checkout (null if using WhatsApp)
- `display_order`: Order within the tab (1, 2, 3, 4)
- `created_at`: Timestamp of creation
- `updated_at`: Timestamp of last update

### 3. plan_features
Stores feature bullets for each plan

```sql
CREATE TABLE plan_features (
  id INT PRIMARY KEY AUTO_INCREMENT,
  plan_id INT NOT NULL,
  feature_text VARCHAR(255) NOT NULL,
  display_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (plan_id) REFERENCES plans(id) ON DELETE CASCADE ON UPDATE CASCADE,
  INDEX idx_plan_id (plan_id),
  INDEX idx_display_order (display_order)
)
```

**Fields:**
- `id`: Unique identifier for the feature
- `plan_id`: Foreign key to plans (CASCADE DELETE)
- `feature_text`: The feature description (e.g., "40,000+ Live Channels")
- `display_order`: Order in feature list (1, 2, 3...)
- `created_at`: Timestamp of creation

## Cascade Delete Behavior

**Deleting a Tab:**
- Automatically deletes all plans in that tab
- Automatically deletes all features for those plans

**Deleting a Plan:**
- Automatically deletes all features for that plan

**Example:**
```
pricing_tabs (id: 1)
  └── plans (id: 1, 2, 3, 4)
      └── plan_features (id: 1-24)
```

If you delete `pricing_tabs.id = 1`, it will:
1. Delete plans 1, 2, 3, 4
2. Delete plan_features 1-24

## API Endpoints

### GET /api/pricing
Returns all tabs with nested plans and features

**Response:**
```json
{
  "success": true,
  "tabs": [
    {
      "id": 1,
      "name": "1 Device",
      "display_order": 1,
      "plans": [
        {
          "id": 1,
          "tab_id": 1,
          "title": "1 Month",
          "price": "$9.99",
          "is_popular": 0,
          "use_whatsapp": 0,
          "checkout_link": null,
          "display_order": 1,
          "features": [
            "SD / HD / FHD / 4K Streams",
            "40,000+ Live Channels",
            "54,000+ VOD"
          ]
        }
      ]
    }
  ]
}
```

### POST /api/pricing/tabs (Protected)
Create a new pricing tab

**Request:**
```json
{
  "name": "4 Devices"
}
```

**Response:**
```json
{
  "success": true,
  "id": 4,
  "message": "Pricing tab created successfully"
}
```

### PUT /api/pricing/tabs/:id (Protected)
Update a pricing tab name

**Request:**
```json
{
  "name": "Updated Name"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Pricing tab updated successfully"
}
```

### DELETE /api/pricing/tabs/:id (Protected)
Delete a pricing tab (and all its plans/features via CASCADE)

**Response:**
```json
{
  "success": true,
  "message": "Pricing tab deleted successfully"
}
```

### POST /api/pricing/plans (Protected)
Create a new plan

**Request:**
```json
{
  "tab_id": 1,
  "title": "24 Months",
  "price": "$99.99",
  "is_popular": 0,
  "use_whatsapp": 0,
  "checkout_link": "https://example.com",
  "features": [
    "Feature 1",
    "Feature 2",
    "Feature 3"
  ]
}
```

### PUT /api/pricing/plans/:id (Protected)
Update a plan

**Request:** (same as POST)

### DELETE /api/pricing/plans/:id (Protected)
Delete a plan (and all its features via CASCADE)

## Default Data Structure

**3 Tabs:**
1. 1 Device
2. 2 Devices
3. 3 Devices

**4 Plans per Tab:**
1. 1 Month
2. 3 Months (varies by tab)
3. 6 Months (marked as Popular)
4. 12 Months

**6 Features per Plan:**
1. SD / HD / FHD / 4K Streams
2. 40,000+ Live Channels
3. 54,000+ VOD
4. VIP & Premium Channels
5. Anti-buffering Technology
6. 24/7 Support

## Rebuild Database

To rebuild the pricing tables to default state:

```bash
cd backend
node rebuild-pricing-tables.js
```

This will:
1. Drop existing pricing tables
2. Recreate with proper structure
3. Insert default data (3 tabs, 12 plans, 72 features)
4. Verify integrity

## Frontend Integration

The dashboard loads pricing data via `loadDeviceTabs()` which calls `GET /api/pricing`.

The public website displays pricing via the `Pricing` component which also calls `GET /api/pricing`.

All changes made in the admin dashboard are immediately reflected on the public website upon save.
