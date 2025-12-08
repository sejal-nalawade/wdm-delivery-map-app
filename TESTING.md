# Testing Guide - Delivery Locations Map App

This document outlines the testing procedures for the Delivery Locations Map Shopify App.

## Table of Contents
- [Testing Environment Setup](#testing-environment-setup)
- [Unit Testing](#unit-testing)
- [Integration Testing](#integration-testing)
- [Manual Testing](#manual-testing)
- [Performance Testing](#performance-testing)
- [Security Testing](#security-testing)

## Testing Environment Setup

### Development Store Setup
1. Create a Shopify development store
2. Install the app in development mode
3. Configure test data

### Local Testing
```bash
npm run dev
```

Access the app at the URL provided by Shopify CLI.

## Unit Testing

### Backend API Tests

#### Test: MapSettings CRUD Operations
```javascript
// Test creating default settings
describe('MapSettings', () => {
  it('should create default settings for new shop', async () => {
    const settings = await db.mapSettings.create({
      data: { shop: 'test-shop.myshopify.com' }
    });
    expect(settings.sameDayMode).toBe('default');
    expect(settings.defaultMode).toBe('sameDay');
  });

  it('should update existing settings', async () => {
    const updated = await db.mapSettings.update({
      where: { shop: 'test-shop.myshopify.com' },
      data: { toggleTextSameDay: 'Express Delivery' }
    });
    expect(updated.toggleTextSameDay).toBe('Express Delivery');
  });
});
```

#### Test: API Endpoints
```javascript
describe('API Routes', () => {
  it('GET /app/map-settings returns settings', async () => {
    const response = await fetch('/app/map-settings');
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.settings).toBeDefined();
  });

  it('POST /app/map-settings saves settings', async () => {
    const response = await fetch('/app/map-settings', {
      method: 'POST',
      body: JSON.stringify({ sameDayMode: 'image' })
    });
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.success).toBe(true);
  });
});
```

### Frontend Component Tests

#### Test: Admin Dashboard
```javascript
describe('Admin Dashboard', () => {
  it('renders all tabs', () => {
    render(<Index />);
    expect(screen.getByText('Map Configuration')).toBeInTheDocument();
    expect(screen.getByText('Button Customization')).toBeInTheDocument();
    expect(screen.getByText('Preview')).toBeInTheDocument();
  });

  it('updates form data on input change', () => {
    const { getByLabelText } = render(<Index />);
    const input = getByLabelText('Same Day Button Text');
    fireEvent.change(input, { target: { value: 'Express' } });
    expect(input.value).toBe('Express');
  });
});
```

## Integration Testing

### Full Flow Tests

#### Test: Settings Save and Retrieve Flow
1. **Setup**: Create test shop
2. **Action**: Save settings via admin UI
3. **Verify**: Settings persisted in database
4. **Action**: Fetch settings via public API
5. **Verify**: Correct settings returned

#### Test: Image Upload Flow
1. **Setup**: Prepare test image
2. **Action**: Upload via admin UI
3. **Verify**: File uploaded to Shopify
4. **Verify**: URL saved in database
5. **Action**: Load storefront
6. **Verify**: Image displays correctly

#### Test: Theme Block Integration
1. **Setup**: Install app in dev store
2. **Action**: Add block to theme
3. **Verify**: Block appears in theme editor
4. **Action**: Configure block settings
5. **Verify**: Settings apply to storefront
6. **Action**: Toggle between maps
7. **Verify**: Maps switch correctly

## Manual Testing

### Admin Dashboard Testing

#### Map Configuration Tab
- [ ] Default map options display correctly
- [ ] Custom image URL field accepts input
- [ ] Description fields accept multiline text
- [ ] Show description checkbox toggles visibility
- [ ] Settings persist after save
- [ ] Loading state shows during save
- [ ] Success toast appears after save
- [ ] Error handling for invalid inputs

#### Button Customization Tab
- [ ] Button text fields update correctly
- [ ] Color pickers work properly
- [ ] Alignment dropdown changes apply
- [ ] Shape dropdown changes apply
- [ ] Default mode selection works
- [ ] Preview updates with changes

#### Preview Tab
- [ ] Current settings display correctly
- [ ] Instructions are clear
- [ ] JSON preview is formatted

### Storefront Block Testing

#### Desktop View
- [ ] Block renders on page
- [ ] Title displays (if enabled)
- [ ] Toggle buttons appear
- [ ] Default map loads
- [ ] Buttons switch maps
- [ ] Descriptions update on toggle
- [ ] Custom colors apply
- [ ] Button alignment works
- [ ] Button shape applies
- [ ] Images load correctly
- [ ] No console errors

#### Mobile View (< 768px)
- [ ] Layout is responsive
- [ ] Buttons stack vertically
- [ ] Map scales properly
- [ ] Text is readable
- [ ] Touch interactions work
- [ ] No horizontal scroll
- [ ] Performance is acceptable

#### Tablet View (768px - 1024px)
- [ ] Layout adapts appropriately
- [ ] All elements visible
- [ ] Interactions work smoothly

### Cross-Browser Testing

Test on:
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)

### Theme Compatibility Testing

Test with popular themes:
- [ ] Dawn (Shopify default)
- [ ] Debut
- [ ] Brooklyn
- [ ] Minimal
- [ ] Custom themes

## Performance Testing

### Load Time Metrics

#### Admin Dashboard
- **Target**: < 2 seconds initial load
- **Measure**: Time to interactive
- **Tool**: Chrome DevTools Performance tab

#### Storefront Block
- **Target**: < 1 second render time
- **Target**: < 100KB JavaScript size
- **Measure**: First Contentful Paint
- **Measure**: Largest Contentful Paint
- **Tool**: Lighthouse

### Performance Checklist
- [ ] JavaScript bundle size < 100KB
- [ ] Images optimized and compressed
- [ ] No blocking scripts
- [ ] Lazy loading implemented
- [ ] API responses < 500ms
- [ ] Database queries optimized
- [ ] No memory leaks

### Load Testing
```bash
# Test API endpoint performance
ab -n 1000 -c 10 http://localhost:3000/api/map-settings/test-shop.myshopify.com
```

**Targets:**
- 1000 requests in < 10 seconds
- No failed requests
- Consistent response times

## Security Testing

### Authentication Tests
- [ ] Admin routes require authentication
- [ ] Public API accessible without auth
- [ ] Session validation works
- [ ] Unauthorized access blocked

### Input Validation Tests
- [ ] SQL injection attempts blocked
- [ ] XSS attempts sanitized
- [ ] File upload validation works
- [ ] URL validation prevents malicious links
- [ ] Color code validation works

### CORS Tests
- [ ] Public API has correct CORS headers
- [ ] Admin API blocks cross-origin requests
- [ ] Preflight requests handled

### Data Privacy Tests
- [ ] Shop data isolated per merchant
- [ ] No data leakage between shops
- [ ] Sensitive data not exposed in API
- [ ] GDPR compliance (if applicable)

## Accessibility Testing

### WCAG 2.1 Compliance
- [ ] Keyboard navigation works
- [ ] Screen reader compatible
- [ ] Color contrast meets AA standards
- [ ] Focus indicators visible
- [ ] Alt text for images
- [ ] Semantic HTML used
- [ ] ARIA labels where needed

### Testing Tools
- Chrome DevTools Lighthouse
- axe DevTools
- WAVE browser extension

## Regression Testing

### Before Each Release
- [ ] All manual tests pass
- [ ] No new console errors
- [ ] Performance metrics maintained
- [ ] Security checks pass
- [ ] Accessibility maintained
- [ ] Cross-browser compatibility verified

### Automated Regression Suite
Create automated tests for:
1. Critical user flows
2. Previously fixed bugs
3. Core functionality
4. API endpoints

## Bug Reporting

### Bug Report Template
```markdown
**Title**: Brief description

**Environment**:
- App version: 
- Browser: 
- Device: 
- Store URL: 

**Steps to Reproduce**:
1. 
2. 
3. 

**Expected Behavior**:

**Actual Behavior**:

**Screenshots**:

**Console Errors**:

**Additional Context**:
```

## Testing Checklist for Releases

### Pre-Release
- [ ] All unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing complete
- [ ] Performance benchmarks met
- [ ] Security audit complete
- [ ] Accessibility verified
- [ ] Documentation updated
- [ ] CHANGELOG updated

### Post-Release
- [ ] Monitor error logs
- [ ] Check performance metrics
- [ ] Verify in production store
- [ ] Test with real merchant data
- [ ] Collect user feedback

## Continuous Testing

### Automated Testing Pipeline
1. **On commit**: Run unit tests
2. **On PR**: Run integration tests
3. **Before deploy**: Full test suite
4. **After deploy**: Smoke tests

### Monitoring
- Set up error tracking (e.g., Sentry)
- Monitor API response times
- Track user interactions
- Log critical errors

## Test Data

### Sample Settings
```json
{
  "sameDayMode": "default",
  "scheduledMode": "image",
  "scheduledImageUrl": "https://example.com/map.png",
  "toggleTextSameDay": "NYC Same Day",
  "toggleTextScheduled": "USA Scheduled",
  "buttonActiveColor": "#FF0000",
  "buttonInactiveColor": "#CCCCCC",
  "buttonAlignment": "center",
  "buttonShape": "rounded",
  "defaultMode": "sameDay",
  "showDescription": true,
  "descriptionSameDay": "Test description",
  "descriptionScheduled": "Test description 2"
}
```

### Test Shops
- `test-shop-1.myshopify.com` - Default settings
- `test-shop-2.myshopify.com` - Custom images
- `test-shop-3.myshopify.com` - Custom styling

## Resources

- [Shopify App Testing Guide](https://shopify.dev/docs/apps/testing)
- [React Testing Library](https://testing-library.com/react)
- [Jest Documentation](https://jestjs.io/)
- [Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci)

---

**Remember**: Testing is not a one-time activity. Continuously test as you develop and maintain the app.

