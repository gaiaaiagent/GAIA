// Save this as test-quartz.js and run with: node test-quartz.js

const fs = require('fs');
const path = require('path');

// Define possible Quartz paths
const possiblePaths = [
    '/Users/darrenzal/GAIA/agent/quartz_temp/quartz',
    '/Users/darrenzal/GAIA/agent/quartz_temp',
    process.cwd(),
    path.resolve(process.cwd(), 'quartz_temp/quartz'),
    path.resolve(process.cwd(), 'quartz'),
    path.resolve(process.cwd(), '../quartz')
];

// Test content
const testContent = `# Ode to Gaia
 
Earth, ancient and alive,
Breathing through forests deep,
Flowing through rivers wide,
Guardian of all that creep.

Gaia, mother of life,
Your wisdom spans eons untold,
Through calm and through strife,
Your stories of balance unfold.

We are but children of yours,
Learning to walk in your care,
May we honor your shores,
And the bounty you freely share.`;

// Test each path
for (const quartzPath of possiblePaths) {
    console.log(`\nTesting Quartz path: ${quartzPath}`);
    
    if (!fs.existsSync(quartzPath)) {
        console.log(`❌ Path doesn't exist: ${quartzPath}`);
        continue;
    }
    
    console.log(`✓ Path exists: ${quartzPath}`);
    
    // Check if it's a directory
    const stats = fs.statSync(quartzPath);
    if (!stats.isDirectory()) {
        console.log(`❌ Not a directory: ${quartzPath}`);
        continue;
    }
    
    console.log(`✓ Is a directory: ${quartzPath}`);
    
    // Check for content directory
    const contentDir = path.join(quartzPath, 'content');
    if (!fs.existsSync(contentDir)) {
        console.log(`❌ Content directory doesn't exist: ${contentDir}`);
        
        // Try to create it
        try {
            fs.mkdirSync(contentDir, { recursive: true });
            console.log(`✓ Created content directory: ${contentDir}`);
        } catch (error) {
            console.log(`❌ Failed to create content directory: ${error.message}`);
            continue;
        }
    } else {
        console.log(`✓ Content directory exists: ${contentDir}`);
    }
    
    // Define test file path
    const testFilePath = path.join(contentDir, 'gaia-test.md');
    
    // Try to write test file
    try {
        fs.writeFileSync(testFilePath, testContent);
        console.log(`✓ Successfully wrote test file to: ${testFilePath}`);
        
        // Verify file exists and has content
        if (fs.existsSync(testFilePath)) {
            const writtenContent = fs.readFileSync(testFilePath, 'utf8');
            console.log(`✓ File exists with ${writtenContent.length} bytes`);
            
            if (writtenContent === testContent) {
                console.log(`✓ Content matches expected text`);
            } else {
                console.log(`❌ Content doesn't match expected text`);
            }
        } else {
            console.log(`❌ File doesn't exist after writing`);
        }
    } catch (error) {
        console.log(`❌ Failed to write test file: ${error.message}`);
    }
}

// Try the specific directory structure from saveFileAction
try {
    const targetPath = '/Users/darrenzal/GAIA/agent/quartz_temp/quartz/content/personal/poetry';
    console.log(`\nTrying to create specific directory structure: ${targetPath}`);
    
    if (!fs.existsSync(targetPath)) {
        fs.mkdirSync(targetPath, { recursive: true });
        console.log(`✓ Created directory structure: ${targetPath}`);
    } else {
        console.log(`✓ Directory structure already exists: ${targetPath}`);
    }
    
    const specificFilePath = path.join(targetPath, 'gaia.md');
    fs.writeFileSync(specificFilePath, testContent);
    console.log(`✓ Successfully wrote file to: ${specificFilePath}`);
} catch (error) {
    console.log(`❌ Failed with specific directory structure: ${error.message}`);
}

console.log('\nDone testing Quartz paths');