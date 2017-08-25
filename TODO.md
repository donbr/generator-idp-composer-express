# TODO Items for Express Generator

* Update and Delete model options, and add these to the routes & views
* Look at complex Query options, using the Queries in the modeling language
- update the Queries to give a template for each
- Convert to Materialize (or offer an option to do that as well as Bootstrap)
* Add drop down input for relational fields
* Add support for user transactions - e.g. Mark Property for Sale
* Add transaction lists - maybe for all transactions or just per type
- Think about users/participants - limit ability to do things based on permissions
* Convert to Fabric v1.0
- support for booleans
- support for arrays
- support for enums
- support for concepts

# model spec
- assets can extend others
- a relationship can be with multiple types, e.g. a Car can link to multiple Parts
- enumeration types
- concepts - e.g. an Address which can be defined then used as a type
- primitives are: String, Double (64 bit), Integer (32 bit), Long (64 bit), DateTime (ISO-8601), Boolean
- Arrays can be used
- Fields can be validated using regex and ranges, can have a default, or can be specified as optional
