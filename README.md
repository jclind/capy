# Capy Game

[Play it live!](https://benlind.com/capy)

To do:

- Add mobile support (clickable controls at bottom): https://stackoverflow.com/questions/9880279/how-do-i-add-a-simple-onclick-event-handler-to-a-canvas-element
- Simplify score-keeping by only tracking the number of snakes you kill
- Add mute button
- oranges are used as throwing weapons after you collect them
  - minigame where you try to balance oranges on your head
- More enemies
  - anacondoodads
  - panthers
  - ocelots
  - eagles

## Deployment

To deploy, upload public/ to a web server. In order to get my server to give a JS MIME type to .mjs files I had to add an .htaccess file with this content:

```
<IfModule mod_mime.c>
  AddType text/javascript js mjs
</IfModule>
```
