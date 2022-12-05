export type PageName =
  | 'account chooser'
  | 'create mural from template'
  | 'home page'
  | 'mural picker'
  | 'mural picker form'
  | 'mural view'
  | 'oauth session activation';

// A `Page` is a representation of the DOM element we will render for a given
// route with some useful metadata.
export type Page = {
  // If specified, whenever we ask for the default element we will return the
  // node that matches this description. If not, we will return the `container`
  // as its stored by `react-testing-library`. Whatever you write here should
  // have its entry in the `items` below.
  defaultElement?: string;
  // The JSX `react-testing-library` will actually render on the screen
  element: () => JSX.Element;
  // A dictionary containing a list of things we can query in the page, where
  // the `key` will be an easy-to-remember string and the `value` will be the
  // `data-qa` attribute as defined in the code. e.g. given the following
  // React Component in our codebase:
  //
  // render() {
  //   <div data-qa="hello-world">
  //     HELLO WORLD
  //   </div>
  // }
  //
  // We would have here:
  //
  // items: {
  //   'hello world message': 'hello-world'
  // }
  items: Record<string, string>;
  // If you need to wait after rendering the page but before it can be consumed
  // you can add that time as a Page constant and the rig will take care of it
  // for you. A good example of this is the `mural` route which has a top-level
  // `withModel` with a 30ms debounce. If we don't wait for it, the rig executes
  // all the logic before all pieces are initialized (render engine, dispatcher,
  // etc).
  renderDelay?: number;
};
