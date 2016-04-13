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

https://dl.dropboxusercontent.com/s/qgashwuoujjk5x3/O_Que_e_o_Que_e_V.epub
https://dl.dropboxusercontent.com/s/k7mq313uv15ytge/A_Chave_do_Tamanho_epub3.epub
https://dl.dropboxusercontent.com/s/gnz076vnuu2b1fg/OMedo.epub
https://dl.dropboxusercontent.com/s/8ssdv8webmi12km/Familia_Sujo_v1.epub
https://dl.dropboxusercontent.com/s/vfahi6tt4xb8ws8/DomQuixoteDasCriancas.epub
https://dl.dropboxusercontent.com/s/se4xx7w7nomjtqp/OSaci.epub
https://dl.dropboxusercontent.com/s/biubfkcqncuoqu0/Branca_de_Neve_v1.epub
https://dl.dropboxusercontent.com/s/6scwxjrald1gkxn/O_flautista_Hamelin_v1.epub
https://dl.dropboxusercontent.com/s/uqs8x8o2hbavksc/MaluquinhoAssombradoOK.epub

### Audio Support

To enable audio (media overlay), add the &audio=1 to the request.

## To-do

* Once the origin of books is known, restrict by domain from inside the app
* Should we deploy it on our side, we must implement a back-end for key management