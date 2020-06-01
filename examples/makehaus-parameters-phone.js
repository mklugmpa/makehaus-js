const { MakeHaus, Stacks } = require('..');
const { Parameters, ParameterType } = require('@makeproaudio/parameters-js');
const fs = require('fs');
const path = require('path');

const jsonPath = path.join(__dirname, 'layouts/makehaus-parameters-phone.json');
const layoutJson = fs.readFileSync(jsonPath);

MakeHaus.init(
  layoutJson,
  () => {
    /* UI Initialization was successful. The web app is now running */
  },
  () => {
    const dynamicWidgetStackNames = [1, 2, 3, 4].map(id => 'stack-' + id);
    const typeButtonStackNames = [5, 6, 7, 8].map(id => 'stack-' + id);
    const bindButtonStacknames = [9, 10, 11, 12].map(id => 'stack-' + id);

    const widgetStacks = Stacks.getAll().filter(stack => dynamicWidgetStackNames.includes(stack.name()));
    const typesStacks = Stacks.getAll().filter(stack => typeButtonStackNames.includes(stack.name()));
    const bindStacks = Stacks.getAll().filter(stack => bindButtonStacknames.includes(stack.name()));

    animateBinds({ widgetStacks, typesStacks, bindStacks });
  }
);

const animateBinds = ({ widgetStacks, typesStacks, bindStacks }) => {
  /* simple animator function to bind two stacks (and internally their respective parameters)*/

  /* create the central parameter to which all the stacks will bind to*/
  const central = Parameters.newParameter('maker', 'central');
  central.updateType({ min: 0, max: 100, step: 1, value: 0, type: ParameterType.NUMBER });

  const parametersOfStack = widgetStacks.map(s => s.parameter());

  bindStacks.forEach(s => {
    s.parameter().addListener(evt => {
      if (evt.value) {
        const mappedIdx =
          s
            .parameter()
            .id()
            .split('-')[1] % 9;
        switch (evt.value) {
          case 'BOUND':
            parametersOfStack[mappedIdx].bindFrom(central, widgetStacks[mappedIdx].uiL());
            break;
          case 'UNBOUND':
            parametersOfStack[mappedIdx].unbind();
            break;
          default:
            break;
        }
      }
    });
  });

  typesStacks.forEach(s => {
    s.parameter().addListener(evt => {
      if (evt.value) {
        const mappedIdx =
          s
            .parameter()
            .id()
            .split('-')[1] % 5;
        switch (evt.value) {
          case 'TYP':
            toggle(mappedIdx);
            break;
          default:
            break;
        }
      }
    });
  });

  let i = 0;
  const toggle = idx => {
    const available = [
      { min: 0, max: 100, step: 1, value: 0, type: ParameterType.NUMBER },
      { values: ['A', 'B', 'C', 'D', 'E'], value: 'A', type: ParameterType.STRING_ARRAY },
      { values: [0, 5, 10, 15, 20], value: 0, type: ParameterType.NUMBER_ARRAY },
      // { value: true, type: ParameterType.BOOLEAN },
    ];

    parametersOfStack[idx].updateType(available[++i % available.length]);
  };
};
