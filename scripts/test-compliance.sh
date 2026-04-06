#!/bin/bash

# Compliance Test Suite
# This script verifies the integrity of the compliance categories and requirements.

echo "🔍 Running Compliance Integrity Tests..."

# 1. Check for required files
FILES=( "src/constants.ts" "src/types.ts" "FRAPPE.md" "INSTALL.md" )
for file in "${FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ Found $file"
    else
        echo "❌ Missing $file"
        exit 1
    fi
done

# 2. Verify Category Count (Should be 7)
CAT_COUNT=$(grep -c "id:" src/constants.ts)
if [ "$CAT_COUNT" -ge 7 ]; then
    echo "✅ Categories verified ($CAT_COUNT found)"
else
    echo "❌ Category count mismatch (Expected 7, found $CAT_COUNT)"
    exit 1
fi

# 3. Verify Requirement Count (Should be 15+)
REQ_COUNT=$(grep -c "categoryId:" src/constants.ts)
if [ "$REQ_COUNT" -ge 15 ]; then
    echo "✅ Requirements verified ($REQ_COUNT found)"
else
    echo "❌ Requirement count mismatch (Expected 15+, found $REQ_COUNT)"
    exit 1
fi

# 4. Build Check
echo "🏗️ Verifying build..."
npm run build > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "✅ Build successful"
else
    echo "❌ Build failed"
    exit 1
fi

echo "✨ All compliance tests passed!"
