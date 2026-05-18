
# College Finder API Documentation

## Base URL
```
http://localhost:3001/api
```

## Environment Variables
Add the following environment variable to your `.env.local` file:
```
VITE_API_BASE_URL=http://localhost:3001/api
```

## Endpoints

### GET /colleges
Fetch all colleges with optional filtering and sorting.

**Query Parameters:**
- `city` (string[]): Filter by cities (comma-separated)
- `streams` (string[]): Filter by streams (comma-separated)
- `type` (string[]): Filter by college types (comma-separated)
- `feesRange` (string): Filter by fees range "min,max"
- `hasHostel` (boolean): Filter by hostel availability
- `search` (string): Search in college name, city, or streams
- `sortBy` (string): Sort criteria (cutoff-asc, cutoff-desc, placement-asc, placement-desc, fees-asc, fees-desc)
- `page` (number): Page number for pagination
- `limit` (number): Number of items per page

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "College Name",
      "logo": "logo_url",
      "city": "City Name",
      "address": "Full Address",
      "website": "https://website.com",
      "phone": "+91-1234567890",
      "affiliation": "University Name",
      "streams": ["Computer Science", "Mechanical"],
      "coursesOffered": 12,
      "totalIntake": 600,
      "fees": 250000,
      "feesRange": { "min": 250000, "max": 300000 },
      "hostelFees": 15000,
      "hasHostel": true,
      "rating": 4.5,
      "placement": 85,
      "placementRange": { "min": 82, "max": 88 },
      "type": "Government",
      "established": 1958,
      "nirf_ranking": 45,
      "cutoff_percentile": 98.5,
      "cutoffRange": { "min": 97.8, "max": 98.5 },
      "infrastructure_score": 8.5,
      "faculty_score": 8.8
    }
  ],
  "total": 50
}
```

### GET /colleges/:id
Fetch a specific college by ID.

**Response:**
```json
{
  "success": true,
  "data": {
    // College object (same structure as above)
  }
}
```

### GET /colleges/stats
Fetch statistics for filter options.

**Response:**
```json
{
  "success": true,
  "data": {
    "totalColleges": 50,
    "cities": ["Mumbai", "Pune", "Nagpur"],
    "streams": ["Computer Science", "Mechanical", "Civil"],
    "types": ["Government", "Private", "Autonomous"],
    "feesRange": { "min": 125000, "max": 460000 }
  }
}
```

## MongoDB Schema

### College Document Structure
```javascript
{
  _id: ObjectId,
  id: Number, // Unique identifier
  name: String,
  logo: String, // URL to logo image
  city: String,
  address: String,
  website: String,
  phone: String,
  affiliation: String,
  streams: [String],
  coursesOffered: Number,
  totalIntake: Number,
  fees: Number,
  feesRange: {
    min: Number,
    max: Number
  },
  hostelFees: Number,
  hasHostel: Boolean,
  rating: Number,
  placement: Number,
  placementRange: {
    min: Number,
    max: Number
  },
  type: String, // "Government" | "Private" | "Autonomous"
  established: Number,
  nirf_ranking: Number,
  cutoff_percentile: Number,
  cutoffRange: {
    min: Number,
    max: Number
  },
  infrastructure_score: Number,
  faculty_score: Number,
  createdAt: Date,
  updatedAt: Date
}
```

## Error Responses
```json
{
  "success": false,
  "message": "Error description"
}
```

## Implementation Notes
- The frontend includes fallback to local data if API is unavailable
- All API calls are cached using React Query with appropriate stale times
- Sorting and filtering can be handled on the backend for better performance
- Pagination is supported but not currently implemented in the UI
