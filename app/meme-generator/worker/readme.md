# Add this on `package.json` file at top level, to run a script
```"type": "module",```

# Put these in tsconfig.json
```
"target": "ES2020",
"module": "ESNext",  // use "commonjs" if you want to run a .ts file as a node script, otherwise use "esnext"
"moduleResolution": "node",
"ts-node": {
    "esm": true,
    "experimentalSpecifierResolution": "node"
},
```

# Add ENV variables in the script that you want to run and sometime it is also needed in mongodb.ts file, at the top
```
process.env.MONGODB_URI = <Pick it from the .env file>;
process.env.MONGODB_DB = "vinit-agrawal-website";
```


# Command to run a ts script:
```node --loader ts-node/esm meme_scraper_and_inserter.ts```
