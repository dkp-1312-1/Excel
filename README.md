# Excel Grid View   

# Objective
Build an Excel-like grid using TypeScript, HTML, CSS and HTML Canvas. The solution should focus on clean
design, maintainability and performance, not only on visible output.

# How to Install and Run
For frontend html file
>use Live Server provided by Ritwick Dey
because it gives CORS error when running html file from local storage

For running ts files of backend for canvas rendering
>npx tsc --watch


# Feature Implemented

- Canvas Grid View : It can stores thousands of data using HTML Canvas
- Column/Row Resizing : It can resize column/row from dragging its header column/row
- Cell Selection : It can selction single to multiselect cells 
- Cell Editing : on double clicking or pressing enter , you can edit cell value
- Row/Column Selection : On clicking header row/column ,select whole row/column respectively
- Summary Calculation : In bottom of page, it shows total count,max,min,sum,average
- Undo/Redo : By typing Ctrl+Z ,Ctrl Y ,you can undo/redo actions 
- Keyboarding Basics : Navigation through arrows,Enter for editing or saving, Esc to cancel edit.


# Folder & Class Structure

Excel.git/
├── .gitignore
├── README.md
├── data.json
├── image.png
├── index.html
├── package-lock.json
├── package.json
├── src/
│   ├── commands/
│   │   ├── EditCellCommand.ts
│   │   ├── ICommand.ts
│   │   ├── ResizeColumnCommand.ts
│   │   └── ResizeRowCommand.ts
│   ├── components/
│   │   ├── Grid.ts
│   │   ├── GridRenderer.ts
│   │   └── SummaryCalculator.ts
│   ├── config/
│   │   └── Config.ts
│   ├── data/
│   │   └── JsonDataLoader.ts
│   ├── handlers/
│   │   ├── CellSelectionHandler.ts
│   │   ├── ColumnSelectionHandler.ts
│   │   ├── IdleHandler.ts
│   │   ├── PointerHandler.ts
│   │   ├── ResizingHandler.ts
│   │   └── RowSelectionHandler.ts
│   ├── index.ts
│   ├── managers/
│   │   ├── CommandManager.ts
│   │   ├── EditManager.ts
│   │   ├── SelectionManager.ts
│   │   └── ViewportManager.ts
│   └── models/
│       ├── CellModel.ts
│       ├── ColumnModel.ts
│       ├── GridDataStore.ts
│       └── RowModel.ts
├── styles.css
└── tsconfig.json



# How OOP Concepts are applied

- Encapsulation : making important states hidden in class making it private . For example , in grid class, all of htmlelement and amangers are being private. while methods of managers are made public

- Abstraction : functionality are abstracts to different classes For example Grid class doesnot know to render whole canvas .it is just calling renderer class to execute it

- Polymorphism : Using same fuction name to override action for different classes. For Example Undo/Redo Commands are used by cell,row,column with same name but doing different actions

- Inheritance : Mkae specialze class from general class for example All command class are inherited from ICommand class.

# How SOLID Principles are applied

- Single Responsibility : Every class can perform single reponsibility work For example grid class cannot render canvas 

- Open/Closed : System is closed for editing fields but it can extend its functionality For example command manager can add more commands if needed 

- Liskov Substitution : objects of a superclass should be replaceable with objects of a subclass without breaking the application For example Edit cell ,resizing commands are using undo/redo functionality of parent class ICommand

- Interface seggregation: For getting data , we can seggregate on based of its type for example Models are seggregated between Cell,Column,Row

- Dependency Injection : object receives its required dependencies from an external source for example grid is getting dataStore from JsonDataLoader instead of creating it by itself

# How command pattern is applied

- whenever any action like resizing,editing cell happen,it store that action in undoStack and clear redo history. and when pressing Ctrl+Z, it redo undoAction and store it in redoStack. 

# How Virtual Rednering Work

- When user is scrolling through scrollBar or any other method,First it saves scrollHeight and scrollWidth to scrollContent of Grid.
- After getting visible range from viewport manager,it draws only the part of which is visible in Excel.

# How data is generated and loaded

- Data is generated first time using generateData. And it is saved to data.json . 
- Every time I load/reload it fetch data from data.json.

# How undo/redo works

- Whenver any action happen,it stores its value in undostakc/redostack given in CommandManager.

- if undo happen,then it takes first action from undo stack and moves it to the redostack. Also remove the action that is given in undoStack.

- if redo happen, then it takes fiest action from redo stack and moves it to the undostack. Also make that action which is in redostack. 

- if any new action happen, then it empty redostack because it is override by new action.

# Test cases covered

Action: Editing Cell
Expected Output: Save changes to Cell

Action: Edit Numeric cell with Text
Expected Output: Save changes to Cell and update Stats

Action: Edit and undo 
Expected Output: undo to last value

Action: Edit and redo
Expected Output: nothing happen

Action: Resize column, undo redo
Expected Output: Resizing correctly,donot overlap or hide column

Action: Resize row, undo redo
Expected Output: Resizing correctly,donot overlap or hide row

Action: Summary numeric range
Expected Output: getting output correctly,does not include text value in count and mathematic actions

Action: Data Loading
Expected Output: Loading data from data.json file and working correctly,generate 50000 records

Action: Scroll near last rows
Expected Output: Scroll more in bottom

Action: Scroll near last column
Expected Output: Scroll more in right side

Action: Load time observation
Expected Output: load time : 300-500 ms 

Action: Arrow Key Navigation
Expected Output: Navigating perfectly and scrolling if going any direction 

Action: Enter Key
Expected Output: Toggle Edit button for editing/commiting 

Action:Ctrl+Z & Ctrl+Y
Expected Output:Make Undo Redo Operations

Action: Selecting Range
Expected Output: By dragging pointer,get selection area for cell

Action: Esc Key
Expected Output: Do not commit edit and save previous/last value of cell

Action: Refresh Rate
Expected Output: While Scrolling,it only limit to render 60 times per second. If it exceeds,then page goes to waiting state.

Action: Handle Negative numbers correctly
Expected Output: Correctly give output by taking negative numbers 

Action: Cursor Style
Expected Output: Give appropriate cursor style in all area

Action: Scrolling when selecting range
Expected Output: Viewport scroll in direction where it is on border

# Accesssibility Consideration

- By using any pointer, user can navigate through any cell in Excel
- By using keyboard, user can undo/redo operations and also edit cell values. 

# Known limitations and next improvements

- Data saving in json file need backend server 
- Multiple Sheets in one Grid View

# Challenges

- Scrollbar Hidden Cells
- Resizing Columns/Rows makes respective Columns/Rows hidden
- Lag Problem- solved using AnimationFrame

