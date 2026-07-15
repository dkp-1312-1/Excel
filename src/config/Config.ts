export const CONFIG = {
    totalRows: 100000,
    totalCols: 500,
    dataRows:50000,
    rowHeight: 25,
    colWidth: 100,
    headerWidth: 50,
    headerHeight: 25,
    font: '14px "Segoe UI", sans-serif',
    headerBg: '#f3f2f1',
    gridColor: '#e1dfdd',
    textColor: '#000000',
    selectionBg: 'rgbA(33,115,70,0.1)',
    selectionBorder: '#217346',
    
    // Editor styling
    editorBorder: '2px solid #02B202',
    editorPadding: '4px',
    editorZIndex: '100',
    commitKey: 'Enter',

    // Interaction margins and thresholds
    dragThreshold: 3,
    doubleClickDragTimeout: 500,
    resizeHoverMargin: 5,
    minRowHeight: 20,
    minColWidth: 20,

    // Statistics limits
    maxCellsForStats: 500000,
    statsTooLargeMsg: 'Range too large for sum computations',

    // Rendering specifics
    cellTextPadding: 6,
    headerBorderColor: '#ccc',
    textBaseline: 'middle' as CanvasTextBaseline,
    textAlignCenter: 'center' as CanvasTextAlign,
    textAlignLeft: 'left' as CanvasTextAlign,

    jsonFilePath:`/mnt/d/Task 3/Excel` as string
};