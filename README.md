# reader-standalone

This is the source code of the stand-alone EPUB 3.0 reader from Elefante Letrado.

## Install dependencies

Run `npm install` and `bower install`.

## Build & development

Run `grunt` for building and `grunt serve` for preview.

## Distribute

Run  `grunt build` and your files will be under the "dist" folder.

## Testing

Running `grunt test` will run the unit tests with karma.

## Test books

Use one of the links below in the URL like this: ?url=path_to_book.epub.

https://dl.dropboxusercontent.com/s/7mxg0u4ecn90lp6/Brincando_Com_Palavras.epub?dl=1
https://dl.dropboxusercontent.com/s/axnvcvafj8eh4mm/A_Cigarra_e_a_Formiga.epub?dl=1
https://dl.dropboxusercontent.com/s/kx56ao2yc63ogec/A_Tartaruga_e_a_Lebre.epub?dl=1
https://dl.dropboxusercontent.com/s/xhzqtafx0wrmd1v/Letra_D.epub?dl=1

## To-do

* How to restrict where to load books from
* Fix issue on Safari with fonts from CSS template
* Fix book loading issue on Internet Explorer
* Should we deploy it on our side, we must implement a back-end for key management