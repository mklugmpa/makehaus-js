import { LayoutParser } from './parser/parser';
import { UI } from './ui/ui';

export const MakeHaus = {
  init: (layoutJson: string, uiReadyCallback: () => void, tcReadyCallback: () => void, config?: { websocketPort?: number; webappPort?: number }) => {
    LayoutParser.getUIWidgets(
      JSON.parse(layoutJson),
      () => {
        const express = require('express');
        const path = require('path');
        const app = express();
        const webappFolder = 'webapp';

        const joined = path.join(__dirname, webappFolder);
        app.use(express.static(joined));
        app.get('/', function(req: any, res: any) {
          res.sendFile(path.join(joined, 'index.html'));
        });
        const finalWebappPort = config ? (config.webappPort ? config.webappPort : 3000) : 3000;
        app.listen(finalWebappPort);
        console.log(`UI running on port:${finalWebappPort}`);
        uiReadyCallback();

        LayoutParser.getTCWidgets(JSON.parse(layoutJson), () => {
          tcReadyCallback();
        });
      },
      config ? (config.websocketPort ? config.websocketPort : 8001) : 8001
    );
  },

  refreshUI: () => {
    UI.refresh();
  },
};
