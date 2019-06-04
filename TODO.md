#OVERVIEW
Alpen is an alternative to nx / bolt / ng

It allows to fetch schematics (example of full schematic package schematic-package-example) and
set them as subpackages of the monorepo. Then installs all dependencies in common package, 
and manages scripts, publishing etc via alpenx.

Adventages:
   - common package versions enforced
   - common commands across stack
   - infinite possibilities for schematics (no complex configs)

#ALPEN RULES
   - all packages have consistent version of the dependencies
   - if new packages schematics introduce different version user needs to be warned and asked to resolve
   - local versions of packages cross link each other
   
#FUNCTIONALITY
   - user can call following npm actions in the initialised workspace
    
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
    
    alpenx add @alpen/schematicName@x.x.x packageName
    alpenx remove packageName
    alpenx serve packageName
    alpenx build packageName
    alpenx lint packageName
    alpenx test packageName
    alpenx test:watch packageName
    alpenx docs packageName
    alpenx clean packageName
    alpenx run packageName
    alpenx publish packageName
    // Extra command:
    alpenx init workspaceName

#HOW IT WORKS
When user executes 'alpenx add @alpen/schematicName@x.x.x packageName':
   - npm installs this dependency as dev dependency
   - copies the content of 'files dir' to the './packages/packageName' dir
   - asks user for: {{name}}, {{version}}, {{description}}, {{author}}, {{repository}}
   - we use this values and use sed to replace markers in all file content also replace {{path}} with path to package
   - moves content of 'files/package.json' to the state.json5
   - checks if all dependencies of the moved package.json dont collide with existing version in ./package.json
   - if collide warn user, append dependencies (even duplicates) and terminate (user needs to resolve manually and type npm install)
   - else we install all dependencies
   
When user executes 'alpenx command ...'
    - when command add / remove / publish / install we act on it:
       - for add above,
       - for remove remove packages/packageName and all its dependencies, then npm install
       - for publish we assume project was built, we do temporally move package.json from state.json and execute npm publish
       - for install we just do npm install on root
    - when other command we do npm run eval-string from state.json5
