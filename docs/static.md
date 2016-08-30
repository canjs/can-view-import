@page can-view-import.pages.static Static Imports
@parent can-view-import.pages

Static imports reflect direct dependencies of this template. Most uses of [can-view-import] will be to static imports.

To make your import be static, it *must* be self closing like `/>`.

## Example

```
<can-import from="mymodule" />
```

which is equivalent to a ES6 import like:

```
import from "mymodule";
```
