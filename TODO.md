#OVERVIEW
Alpen is an alternative to nx / bolt / ng

It allows to fetch schematics (example of full schematic package schematic-package-example) and
set them as subpackages of the monorepo. Then installs all dependencies in common package, 
and manages scripts, publishing etc via alpen.

use: https://www.npmjs.com/package/npm-run
use cli from: https://www.twilio.com/blog/how-to-build-a-cli-with-node-js

Adventages:
   - common package versions enforced
   - common commands across stack
   - infinite possibilities for schematics (no complex configs)

#ALPEN RULES
   - all packages have consistent version of the dependencies
   - if new packages schematics introduce different version user needs to be warned and asked to resolve
   - local versions of packages cross link each other
   
#FUNCTIONALITY
   - user can call following npm actions in the initialised workspace ?????? do we need this????
    
    npm run add -- @alpen/schematicName@x.x.x packageName
    npm run remove -- packageName
    npm run serve -- packageName
    npm run build -- packageName
    npm run lint -- packageName
    npm run test -- packageName
    npm run test:watch -- packageName
    npm run docs -- packageName
    npm run clean -- packageName
    npm run run -- packageName
    npm run publish -- packageName
    
   - user can call following cli actions
    
    alpen add @alpen/schematicName@x.x.x packageName
    alpen remove packageName
    alpen serve packageName
    alpen build packageName
    alpen lint packageName
    alpen test packageName
    alpen test:watch packageName
    alpen docs packageName
    alpen clean packageName
    alpen run packageName
    alpen publish packageName
    // Extra command:
    alpen init workspaceName

#HOW IT WORKS
When user executes 'alpen add @alpen/schematicName@x.x.x packageName':
   - npm installs this dependency as dev dependency
   - copies the content of 'files dir' to the './packages/packageName' dir
   - asks user for: {{name}}, {{version}}, {{description}}, {{author}}, {{repository}}
   - we use this values and use sed to replace markers in all file content also replace {{path}} & {escaped-path}} with path to package
   - sets hash of alpen.package.json in .alpenrc
   - checks if all dependencies of the moved package.json dont collide with existing version in ./package.json
   - if collide warn user, append dependencies (even duplicates) and terminate (user needs to resolve manually and type npm install)
   - else we install all dependencies
   
When user executes 'alpen command ...'
    - when command add / remove we act on it:
       - for add above,
       - for remove remove packages/packageName and all its dependencies, then npm install
    - when other command 
       - we check if alpen.package.json changed via hash if so we update via nps scripts
       - we use generated package-scripts.js via nps to execute commands
