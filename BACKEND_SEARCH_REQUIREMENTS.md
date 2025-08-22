# Backend Search Requirements for Pet API

## Search Functionality Requirements

The frontend now sends search queries to the backend API. The backend should implement the following search functionality:

### 1. Search Parameter
- **Parameter**: `search` (string)
- **Location**: Query parameter in GET `/pet/by/` endpoint
- **Example**: `GET /pet/by/?search=chocolate&page=1&limit=10`

### 2. Search Priority (IMPORTANT)
**Search is the PRIMARY filter** that should work across ALL categories:
- When a search term is provided, it should search through ALL pets regardless of category
- Category filters should be applied AFTER search results
- Example: Search "cho" should find "Chocolate" (cat) AND "Chouchou" (dog)

### 3. Search Scope
The search should search through **ALL** the following fields in the pet documents:

#### Primary Search Fields:
- **Pet Name** (`name`) - Most important
- **Breed** (`breed`) - Second priority
- **Species** (`species`) - Third priority

#### Additional Search Fields (if available):
- **Description** (`description`)
- **Notes** (`notes`)
- **Characteristics** (`characteristics`)
- **Health Information** (`healthInfo`)

### 4. Search Behavior Requirements

#### Case Insensitive:
- Search should be case-insensitive
- "Chocolate", "chocolate", "CHOCOLATE" should all match

#### Partial Matching:
- Should match partial strings at the beginning, middle, or end
- Examples:
  - Search "ch" should match: "Chocolate", "Chouchioyu", "Cho", "Chima"
  - Search "gold" should match: "Golden Retriever", "Goldfish"

#### Multi-language Support:
- Search should work for both **English** and **Arabic** text
- If pet names/breeds are stored in both languages, search both
- Example: If a pet is named "كوكو" (Coco), searching "coco" should find it

#### Fuzzy Matching (Optional but Recommended):
- Handle minor typos and variations
- Example: "labrador" should match "Labrador Retriever"

### 5. Filter Priority Order

The backend should apply filters in this order:

1. **SEARCH** (Primary) - Search across ALL categories
2. **CATEGORY** (Secondary) - Filter by species if selected
3. **Other filters** (Tertiary) - Age, size, gender, etc.

### 6. All Filter Parameters

The backend should support these query parameters:

#### Required Parameters:
- `page` (number) - Page number for pagination
- `limit` (number) - Number of items per page

#### Search Parameters:
- `search` (string) - Search term for name, breed, species, etc.

#### Category Parameters:
- `species` (string) - Pet species/category (dog, cat, rabbit, etc.)

#### Filter Parameters:
- `age` (string) - Age group (baby, young, adult, senior)
- `size` (string) - Size (small, medium, large)
- `gender` (string) - Gender (male, female)
- `activity` (string) - Activity level (low, medium, high)
- `distance` (number) - Maximum distance in kilometers
- `status` (string) - Pet status (available, adopted, etc.)
- `city` (string) - City/location filter

### 7. Search Implementation Examples

#### MongoDB Query Example:
```javascript
// Example MongoDB aggregation pipeline
const buildQuery = (search, species, otherFilters) => {
  let query = {};
  
  // PRIMARY: Search across all categories
  if (search && search.trim()) {
    const searchRegex = new RegExp(search.trim(), 'i');
    query.$or = [
      { name: searchRegex },
      { breed: searchRegex },
      { species: searchRegex },
      // Add more fields as needed
    ];
  }
  
  // SECONDARY: Category filter (only if explicitly selected)
  if (species && species.trim()) {
    query.species = species;
  }
  
  // TERTIARY: Other filters
  if (otherFilters.age) query.ageGroup = otherFilters.age;
  if (otherFilters.size) query.size = otherFilters.size;
  if (otherFilters.gender) query.gender = otherFilters.gender;
  if (otherFilters.activity) query.activity = otherFilters.activity;
  if (otherFilters.status) query.status = otherFilters.status;
  if (otherFilters.city) query.city = otherFilters.city;
  // ... other filters
  
  return query;
};
```

#### Node.js/Express Example:
```javascript
// In your GET /pet/by/ endpoint
app.get('/pet/by/', async (req, res) => {
  const { 
    search, 
    species, 
    age, 
    size, 
    gender, 
    activity, 
    distance, 
    status, 
    city,
    page = 1, 
    limit = 10 
  } = req.query;
  
  let query = {};
  
  // PRIMARY: Search functionality (searches ALL categories)
  if (search && search.trim()) {
    const searchRegex = new RegExp(search.trim(), 'i');
    query.$or = [
      { name: searchRegex },
      { breed: searchRegex },
      { species: searchRegex },
      // Add more fields as needed
    ];
  }
  
  // SECONDARY: Category filter (only if explicitly selected)
  if (species && species.trim()) {
    query.species = species;
  }
  
  // TERTIARY: Other filters
  if (age) query.ageGroup = age;
  if (size) query.size = size;
  if (gender) query.gender = gender;
  if (activity) query.activity = activity;
  if (status) query.status = status;
  if (city) query.city = city;
  
  // Distance filter (special handling for location-based filtering)
  if (distance) {
    // Implement distance-based filtering logic
    // This might require geospatial queries
  }
  
  // Execute paginated query
  const pets = await Pet.find(query)
    .skip((page - 1) * limit)
    .limit(limit)
    .sort({ createdAt: -1 });
    
  const total = await Pet.countDocuments(query);
  
  res.json({
    docs: pets,
    totalDocs: total,
    totalPages: Math.ceil(total / limit),
    page: parseInt(page),
    hasNextPage: page * limit < total,
    hasPrevPage: page > 1
  });
});
```

### 8. Expected Response Format
The search should return the same paginated response format:

```json
{
  "docs": [
    {
      "_id": "...",
      "name": "Chocolate",
      "breed": "Golden Retriever",
      "species": "dog",
      "age": { "value": 2, "unit": "years" },
      "size": "large",
      "gender": "male",
      "activity": "high",
      "images": ["..."],
      "location": { "coordinates": [lng, lat] },
      "status": "available",
      // ... other pet fields
    }
  ],
  "totalDocs": 15,
  "totalPages": 2,
  "page": 1,
  "hasNextPage": true,
  "hasPrevPage": false
}
```

### 9. Testing Scenarios

Test these search scenarios:

1. **Basic Search**: Search "chocolate" should find pets named "Chocolate" from ANY category
2. **Partial Match**: Search "ch" should find "Chocolate" (cat), "Chouchou" (dog), "Cho" (any category)
3. **Case Insensitive**: Search "CHOCOLATE" should find "Chocolate"
4. **Breed Search**: Search "golden" should find "Golden Retriever" from any category
5. **Multi-language**: Search "كوكو" should find pets with Arabic names
6. **Search + Category**: Search "chocolate" + filter by "dog" should find "Chocolate" dogs only
7. **Search + Category**: Search "ch" + filter by "cat" should find cats with names starting with "ch"
8. **Multiple Filters**: Search "ch" + category "dog" + size "large" + gender "male"
9. **Empty Search**: No search parameter should return all pets
10. **Special Characters**: Handle special characters properly

### 10. Performance Considerations

- **Indexing**: Create text indexes on searchable fields
- **Pagination**: Always use pagination to avoid loading too much data
- **Caching**: Consider caching frequent search results
- **Query Optimization**: Use proper MongoDB indexes for efficient searching
- **Geospatial Indexes**: For distance-based filtering

### 11. Integration with Frontend

The frontend will:
- Send search queries with 500ms debouncing
- Reset pagination when search changes
- Show loading states during search
- Display appropriate "no results" messages
- Support infinite scrolling for search results
- Apply category filters as secondary filters
- Send all filter parameters from the filter page

---

**Note**: Search should work as the PRIMARY filter across ALL categories, with category selection being a SECONDARY filter that refines the search results. All other filters (age, size, gender, activity, distance) should be applied as additional refinements.
