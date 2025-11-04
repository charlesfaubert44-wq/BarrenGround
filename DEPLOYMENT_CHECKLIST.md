# Deployment Checklist for Promo & News Backend

Use this checklist to ensure proper deployment of the Promo & News backend implementation.

## Pre-Deployment Checklist

### 1. Code Review
- [x] All files created as specified
- [x] TypeScript compiles without errors in new files
- [x] Code follows existing patterns
- [x] All endpoints implemented
- [x] Validation added to all create/update endpoints
- [x] Authorization middleware applied correctly

### 2. Database Migration
- [ ] Database backup created (IMPORTANT!)
- [ ] Migration script reviewed: `backend/src/config/schema-promos.sql`
- [ ] Migration run on development database
- [ ] Tables verified: `promos` and `news`
- [ ] Indexes verified: `idx_promos_active`, `idx_news_active`

**Run migration:**
```bash
cd backend
psql -U postgres -d barrenground -f src/config/schema-promos.sql
```

### 3. Local Testing
- [ ] Backend server starts without errors
- [ ] Employee dashboard connects to backend
- [ ] Can view empty promo list
- [ ] Can create new promo
- [ ] Can edit promo
- [ ] Can toggle promo active status
- [ ] Can delete promo
- [ ] Can view empty news list
- [ ] Can create news item
- [ ] Can edit news item
- [ ] Can toggle news active status
- [ ] Can delete news item
- [ ] Public endpoints work without auth
- [ ] Protected endpoints require auth

### 4. API Testing
- [ ] Test GET /api/promos (with auth)
- [ ] Test GET /api/promos/active (no auth)
- [ ] Test POST /api/promos (with auth)
- [ ] Test PUT /api/promos/:id (with auth)
- [ ] Test PUT /api/promos/:id/active (with auth)
- [ ] Test DELETE /api/promos/:id (with auth)
- [ ] Test GET /api/news (with auth)
- [ ] Test GET /api/news/active (no auth)
- [ ] Test POST /api/news (with auth)
- [ ] Test PUT /api/news/:id (with auth)
- [ ] Test PUT /api/news/:id/active (with auth)
- [ ] Test DELETE /api/news/:id (with auth)

### 5. Validation Testing
- [ ] Required fields validated (title, description/content, image_url)
- [ ] URL validation works for image_url and link_url
- [ ] Date validation works for start_date and end_date
- [ ] Priority validation works (0-100 range)
- [ ] Error messages are user-friendly

### 6. Security Testing
- [ ] Unauthorized requests return 401
- [ ] Invalid tokens return 403
- [ ] SQL injection attempts fail (parameterized queries)
- [ ] CORS settings allow employee dashboard
- [ ] Public endpoints accessible without auth
- [ ] Protected endpoints require valid token

## Deployment Steps

### Development Environment

1. **Pull Latest Code**
   ```bash
   git pull origin master
   ```

2. **Install Dependencies** (if needed)
   ```bash
   cd backend
   npm install
   ```

3. **Run Database Migration**
   ```bash
   psql -U postgres -d barrenground -f src/config/schema-promos.sql
   ```

4. **Restart Backend Server**
   ```bash
   npm run dev
   ```

5. **Verify Endpoints**
   - Check server logs for startup errors
   - Test health endpoint: `GET http://localhost:3000/health`
   - Test promo endpoint: `GET http://localhost:3000/api/promos/active`

### Production Environment

1. **Backup Database**
   ```bash
   pg_dump -U postgres barrenground > barrenground_backup_$(date +%Y%m%d).sql
   ```

2. **Run Migration on Production DB**
   ```bash
   psql -U postgres -d barrenground -f backend/src/config/schema-promos.sql
   ```

3. **Deploy Backend**
   - If using Railway: Git push triggers automatic deployment
   - If using Vercel: Verify serverless function deployment
   - If using manual deploy: Build and restart server
   ```bash
   npm run build
   npm start
   ```

4. **Verify Production Deployment**
   - [ ] Backend responds to health check
   - [ ] Promo endpoints accessible
   - [ ] News endpoints accessible
   - [ ] Employee dashboard can connect
   - [ ] CORS working correctly

5. **Monitor Logs**
   - Check for any startup errors
   - Monitor for database connection issues
   - Watch for authentication errors

## Post-Deployment Checklist

### Functionality Verification
- [ ] Employee can log into dashboard
- [ ] Promo management page loads
- [ ] News management page loads
- [ ] Can create sample promo
- [ ] Can edit sample promo
- [ ] Can delete sample promo
- [ ] Can create sample news
- [ ] Can edit sample news
- [ ] Can delete sample news

### Performance Check
- [ ] API response times acceptable (<500ms)
- [ ] Database queries using indexes
- [ ] No memory leaks observed
- [ ] Server CPU/memory usage normal

### Customer Experience
- [ ] Active promos display on homepage (if integrated)
- [ ] Active news display on homepage (if integrated)
- [ ] Public endpoints respond quickly
- [ ] Images load correctly

## Rollback Plan

If issues occur after deployment:

### 1. Immediate Rollback
```bash
# Revert code changes
git revert <commit_hash>
git push origin master

# Restore database (if needed)
psql -U postgres -d barrenground < barrenground_backup_YYYYMMDD.sql

# Restart server
npm restart
```

### 2. Partial Rollback (Routes Only)
Edit `backend/src/server.ts` and comment out:
```typescript
// app.use('/api/promos', promoRoutes);
// app.use('/api/news', newsRoutes);
```
Then restart server.

## Common Issues and Solutions

### Issue: Tables already exist
**Solution:** This is fine if using `CREATE TABLE IF NOT EXISTS`. If tables exist from previous attempts, drop them first:
```sql
DROP TABLE IF EXISTS promos;
DROP TABLE IF EXISTS news;
```

### Issue: Migration fails with permission error
**Solution:** Ensure database user has CREATE TABLE privileges:
```sql
GRANT ALL PRIVILEGES ON DATABASE barrenground TO your_user;
```

### Issue: 404 on new endpoints
**Solution:**
- Verify routes registered in server.ts
- Check server logs for startup errors
- Restart backend server

### Issue: CORS errors from dashboard
**Solution:** Add employee dashboard URL to CORS config in server.ts

### Issue: All requests return 401
**Solution:** Check authentication middleware is properly configured and tokens are valid

## Documentation Reference

- Implementation details: `IMPLEMENTATION_SUMMARY.md`
- Database migration: `backend/MIGRATION_INSTRUCTIONS.md`
- Testing procedures: `backend/TESTING_GUIDE.md`
- API reference: `backend/API_REFERENCE.md`

## Support Contacts

- Database issues: DBA team
- Backend issues: Backend team
- Frontend integration: Frontend team
- Deployment issues: DevOps team

## Success Metrics

Track these metrics post-deployment:
- Number of promos created
- Number of news items created
- API response times
- Error rates
- Employee dashboard usage

## Sign-Off

- [ ] Developer: Implementation complete
- [ ] QA: Testing complete
- [ ] DBA: Migration verified
- [ ] DevOps: Deployment successful
- [ ] Product Owner: Functionality approved

---

**Deployment Date:** _________________
**Deployed By:** _________________
**Environment:** [ ] Development [ ] Staging [ ] Production
**Version/Commit:** _________________
