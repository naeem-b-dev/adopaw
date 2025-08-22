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

### 6. Search Implementation Examples

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
  if (otherFilters.status) query.status = otherFilters.status;
  if (otherFilters.gender) query.gender = otherFilters.gender;
  // ... other filters
  
  return query;
};
```

#### Node.js/Express Example:
```javascript
// In your GET /pet/by/ endpoint
app.get('/pet/by/', async (req, res) => {
  const { search, species, page = 1, limit = 10, ...otherFilters } = req.query;
  
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
  if (otherFilters.status) query.status = otherFilters.status;
  if (otherFilters.gender) query.gender = otherFilters.gender;
  if (otherFilters.size) query.size = otherFilters.size;
  // ... other filters
  
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

### 7. Expected Response Format
The search should return the same paginated response format:

```json
{
  "docs": [
    {
      "_id": "...",
      "name": "Chocolate",
      "breed": "Golden Retriever",
      "species": "dog",
      "images": ["..."],
      "age": { "value": 2, "unit": "years" },
      "location": { "coordinates": [lng, lat] },
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

### 8. Testing Scenarios

Test these search scenarios:

1. **Basic Search**: Search "chocolate" should find pets named "Chocolate" from ANY category
2. **Partial Match**: Search "ch" should find "Chocolate" (cat), "Chouchou" (dog), "Cho" (any category)
3. **Case Insensitive**: Search "CHOCOLATE" should find "Chocolate"
4. **Breed Search**: Search "golden" should find "Golden Retriever" from any category
5. **Multi-language**: Search "كوكو" should find pets with Arabic names
6. **Search + Category**: Search "chocolate" + filter by "dog" should find "Chocolate" dogs only
7. **Search + Category**: Search "ch" + filter by "cat" should find cats with names starting with "ch"
8. **Empty Search**: No search parameter should return all pets
9. **Special Characters**: Handle special characters properly

### 9. Performance Considerations

- **Indexing**: Create text indexes on searchable fields
- **Pagination**: Always use pagination to avoid loading too much data
- **Caching**: Consider caching frequent search results
- **Query Optimization**: Use proper MongoDB indexes for efficient searching

### 10. Integration with Frontend

The frontend will:
- Send search queries with 500ms debouncing
- Reset pagination when search changes
- Show loading states during search
- Display appropriate "no results" messages
- Support infinite scrolling for search results
- Apply category filters as secondary filters

---

**Note**: Search should work as the PRIMARY filter across ALL categories, with category selection being a SECONDARY filter that refines the search results.
