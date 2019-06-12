#OVERVIEW
Alpen is an alternative to nx / bolt / ng

It allows to fetch schematics (example of full schematic package schematic-examples) and
set them as subpackages of the monorepo. Then installs all dependencies in common package, 
and manages scripts, publishing etc via alpen.

use code from: https://github.com/kentcdodds/nps/blob/master/src/index.js and whole nps!
use cli from: https://www.twilio.com/blog/how-to-build-a-cli-with-node-js

// TODO: 
//  - make 'alpen init name' a syntatic sugar for 'alpen add defaultWorkspace name'
//    (workspace added same as packages)
//  - allow adding workspaces even inside other workspaces - just ask if user is aware

Adventages:
   - common package versions enforced
   - common commands across stack
   - infinite possibilities for schematics (no complex configs)

#ALPEN RULES
   - all packages have consistent version of the dependencies
   - if new packages schematics introduce different version user needs to be warned and asked to resolve
   - local versions of packages cross link each other
   
#HOW IT WORKS
When user executes 'alpen add @alpen/templateName@x.x.x packageName':
   - npm installs this dependency as dev dependency
   - copies the content of 'files dir' to the './packages/packageName' dir
   - checks if all dependencies of the package.json dont collide with existing version in ./package.json
   - if collide warn user, append dependencies (even duplicates) and terminate (user needs to resolve manually and type npm install)
   - else we install all dependencies
   - copy content of package to .alpenrc and remove versions from dependencies - store as an array
   - make hash of dependencies to check if something changed
   
When user executes 'alpen command ...'
    - when command add / remove we act on it:
       - for add above,
       - for remove remove packages/packageName and all its dependencies, then npm install
    - when publish
        - produce package.json in subpackage
        - recreate dependency objects from array of dep keys
    - when other command 
       - we install deps via npm
       - we udpate other package deps
       - we execute script

   
#FUNCTIONALITY
   - user can call following npm actions in the initialised workspace ?????? do we need this????
    
    npm run add -- @alpen/templateName@x.x.x packageName
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
    
    alpen add @alpen/templateName@x.x.x packageName
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
