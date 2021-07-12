Ext.require([
    'BookWindow'
]);

var book = Ext.define('Books', {
    extend: 'Ext.data.Model',
    idProperty: 'id',
    fields: [{name: 'id', type: 'int'}, 'name', 'desc', 'state'],
});

var statuses = Ext.create('Ext.data.Store', {
    fields: ['id', 'name'],
    data: [
        {id: 0, name: 'new'},
        {id: 1, name: 'in work'},
        {id: 2, name: 'published'},
        {id: 3, name: 'archive'}
    ]
});


Ext.onReady(function () {

    var selRec, bookArr = [];

    // create in-memory Data Store
    var memStore = Ext.create('Ext.data.Store', {
        autoload: true,
        id: 'memBookStore',
        model: 'Books',
        pageSize: 5,
        proxy: {
            enablePaging: true,
            type: 'memory',
        },
        data: bookArr,
    });

    var locStorage = localStorage.getItem('book-shelf');
    if (locStorage) {
        var ls = JSON.parse(locStorage);
        ls.forEach(t => {
            bookArr.push([...t]);
        });
    }

    if (1 && !bookArr.length) {
        for (i = 0; i < 20; i++) {
            rec = bookArr.push([i + 1,
                'Book' + (i + 1),
                'Description' + (i + 1),
                statuses.getAt(i % 4).data.name
            ]);
        }
    }
    memStore.reload();

    // create the grid
    var grid = Ext.create('Ext.grid.Panel', {
        requires: [],
        bufferedRenderer: false,
        store: memStore,
        plugins: {
            ptype: 'gridfilters',
        },
        tbar: {
            xtype: 'toolbar',
            dock: 'top',
            items: [
                {
                    xtype: 'button',
                    text: 'Add',
                    handler: function () {
                        Ext.create('BookWindow', {
                            title: 'Add book', arrMem: bookArr,
                            memStore: memStore, editMode: false
                        }).show();
                    }
                },
                {
                    xtype: 'button',
                    text: 'Edit',
                    handler: function () {
                        if (selRec) {
                            var id = bookArr.findIndex(el => el[0] === selRec.id);
                            if (~id) {
                                Ext.create('BookWindow', {
                                    title: 'Edit book info',
                                    arrMem: bookArr,
                                    memStore: memStore,
                                    editMode: true,
                                    bookId: id
                                }).show();
                            }
                        }
                    }
                },
                {
                    xtype: 'button', text: 'Delete',
                    handler: function () {
                        if (selRec) {
                            var id = bookArr.findIndex(el => el[0] === selRec.id);
                            if (~id) {
                                bookArr.splice(id, 1);
                                memStore.reload();
                                localStorage.setItem('book-shelf', JSON.stringify(bookArr));
                                var detailPanel = Ext.getCmp('detailPanel');
                                detailPanel.update('Please select a book to see additional details.');
                            }
                        }
                    }
                }
            ]
        },
        columns: [
            {text: 'No', xtype: 'rownumberer', width: 30},
            {text: 'id', dataIndex: 'id', width: 40, hidden: true},
            {text: "Name", width: 150, dataIndex: 'name', sortable: true, filter: 'string'},
            // {text: "Description", width: 120, dataIndex: 'desc', sortable: true, filter: 'string'},
            {text: "Status", width: 50, dataIndex: 'state', sortable: true, filter: 'string'},
        ],
        bbar: {
            xtype: 'pagingtoolbar',
            dock: 'bottom',
            displayInfo: true,
            emptyMsg: 'No pages to display'
        },
        forceFit: true,
        split: true,
        region: 'north',
    });

    // define a template to use for the detail view
    var bookTplMarkup = [
        '<b>Name:</b> {name}<br/>',
        '<b>Description:</b> {desc}<br/>',
        '<b>Status:</b> {state}<br/>'
    ];
    var bookTpl = Ext.create('Ext.Template', bookTplMarkup);

    Ext.create('Ext.Panel', {
        renderTo: 'book-shelf',
        frame: true,
        title: 'Book List',
        layout: 'anchor',
        items: [
            grid,
            {
                id: 'detailPanel',
                region: 'center',
                bodyPadding: 7,
                bodyStyle: "background: #ffffff;",
                html: 'Please select a book to see additional details.'
            },
        ],
    });

    grid.getSelectionModel().on('selectionchange', function (sm, selectedRecord) {
        if (selectedRecord.length) {
            selRec = selectedRecord[0];
            var detailPanel = Ext.getCmp('detailPanel');
            detailPanel.update(bookTpl.apply(selectedRecord[0].data));
        } else
            selRec = null;
    });

});
