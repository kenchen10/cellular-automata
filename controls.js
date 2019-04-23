// var gi = new guify({
//             theme: 'dark', // dark, light, yorha, or theme object
//             align: 'right', // left, right
//             width: 300,
//             barMode: 'none', // none, overlay, above, offset
//             panelMode: 'inner',
//             opacity: 0.95,
//             open: true
//         });
//
// // Populate the GUI
// var someNumber = 0;
// gi.Register({
// type: 'range',
// label: 'Range',
// min: 0, max: 10, step: 1,
// object: this, property: "someNumber",
// onChange: (data) => {
//     console.log(someNumber);
// }
// });
// var steppedNumber = 8;
// gi.Register({
// type: 'range',
// label: 'Stepped Range',
// min: 8, max: 64, step: 8,
// object: this, property: "steppedNumber",
// onChange: (data) => {
//     console.log(steppedNumber);
// }
// });
// var logNumber = 20;
// gi.Register({
// type: 'range',
// label: 'Log Range',
// object: this,
// property: 'logNumber',
// min: 0.1, max: 100, scale: 'log',
// onChange: (data) => {
//     console.log(logNumber);
// }
// })
// gi.Register({
// type: 'title',
// label: 'Title'
// });
// gi.Register({
// type: 'button',
// label: 'Button',
// action: () => {
//     console.log('Clicked');
// }
// })
// var checkboxTest = false;
// gi.Register({
// type: 'checkbox',
// label: 'Checkbox',
// object: this,
// property: 'checkboxTest',
// onChange: (data) => {
//     console.log(checkboxTest);
// }
// })
// var testSelection = 'Option 1';
// gi.Register({
// type: 'select',
// label: 'Select',
// object: this,
// property: 'testSelection',
// options: ['Option 1', 'Option 2'],
// onChange: (data) => {
//     console.log(testSelection);
// }
// })
// var testText = 'Some text here';
// gi.Register({
// type: 'text',
// label: 'Text',
// object: this,
// property: 'testText',
// onChange: (data) => {
//     console.log(testText);
// }
// })
// var rgbColor = 'rgb(255, 0, 0)';
// gi.Register({
// type: 'color',
// label: 'RGB Color',
// format: 'rgb',
// object: this,
// property: 'rgbColor'
// })
// var hexColor = '#00FF00';
// gi.Register({
// type: 'color',
// label: 'Hex Color',
// format: 'hex',
// object: this,
// property: 'hexColor'
// })
// var file = null;
// gi.Register({
// type: 'file',
// label: 'File',
// object: this,
// property: 'file',
// onChange: (data) => {
//     console.log(data);
// }
// })
// var displayValue = "Displays the toString representation of a variable.";
// gi.Register({
// type: 'display',
// label: 'Display',
// object: this,
// property: 'displayValue'
// })
// // Folder example
// gi.Register({
// type: 'folder',
// label: 'Folder',
// open: false
// });
// // Add to the folder example
// gi.Register([
// { type: 'range', label: 'Range', min: 0, max: 20, step: 1 },
// { type: 'title', label: 'Title' },
// { type: 'button', label: 'Button' },
// { type: 'checkbox', label: 'Checkbox' },
// { type: 'select', label: 'Select', options: ["Option A", "Option B"] },
// { type: 'text', label: 'Text', initial: 'Some text' },
// { type: 'color', label: 'Color' },
// ], {
// folder: 'Folder'
// });
// gi.Register({
// type: 'text',
// label: 'long long long long long long long long label',
// folder: 'Folder',
// })
// // Add a nested folder
// gi.Register({ type: 'folder', label: 'Nested Folder', folder: 'Folder', open: false });
// gi.Register({ type: 'text', label: 'Folder Text', folder: 'Nested Folder', initial: 'Nested text' });
// // Debug folder
// gi.Register({
// type: 'folder',
// label: 'Debug',
// open: false
// })
// gi.Register({
// type: 'button',
// label: 'Toast Test',
// folder: 'Debug',
// action: () => {
//     // Send a toast
//     gi.Toast('Test Toast');
// },
// })
// gi.Register({
// type: 'button',
// label: 'Randomize Components',
// folder: 'Debug',
// action: () => {
//     // Randomize all the values bound to components in this example.
//     // Good test for whether component binding is actually working.
//     someNumber = Math.random() * 10;
//     steppedNumber = ~~((Math.random() + 0.1) * 8) * 8;
//     logNumber = Math.random() * 99 + 0.1;
//     checkboxTest = !checkboxTest;
//     testText = (Math.random() + 1).toString(36).substring(7); // Random string
//     rgbColor = 'rgb(' + Math.random() * 255 + ', 0, 0)';
//     hexColor = "#";
//     for(var i = 0; i < 6; i++) hexColor += Math.floor(Math.random() * 9).toString()
//     testSelection = "Option " + (Math.random() < 0.5 ? "1" : "2");
// }
// })
// // This button gets automatically removed by our API
// var removedButton = gi.Register({
// type: 'button',
// label: 'Button',
// action: () => {
//     console.log('Clicked');
// }
// })
// removedButton.container.disabled = true;
// gi.Remove(removedButton);
