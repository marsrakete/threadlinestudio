# Standalone Git-checkout consumer

This small Node.js project uses its own filter selection and settings while
loading the library from another Threadline Studio checkout. It does not rely
on the consumer being inside the Threadline repository.

From this directory, set `THREADLINE_FILTERS_PATH` to the root of the separate
Threadline Studio checkout, then run `npm start`:

```powershell
$env:THREADLINE_FILTERS_PATH = "C:\Projects\threadlinestudio"
npm start
```

```sh
THREADLINE_FILTERS_PATH=/projects/threadlinestudio npm start
```

The consumer enables only pixel filters and campaigns, applies its own Sepia
and rainbow settings to a sample RGBA buffer, and prints the result as JSON.

For the browser demo, serve the Threadline Studio repository root over HTTP and
open `/tests/fixtures/repository-consumer/browser.html?libraryBase=/packages/threadline-filters/`.
When serving this example from another location, set `libraryBase` to the
filter-library directory URL in that checkout. The browser contract test serves
the repository and checks the rendered canvas and `pageerror` events.
