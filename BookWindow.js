/**
*   BookWindow class definition
*/

Ext.define('BookWindow', {
    extend: 'Ext.window.Window',
    config: {
        arrMem: [],
        memStore: null,
        editMode: false,
        bookId: null
    },
    constructor: function (config) {
        this.callParent(arguments); 
        return this;
    },
    autoload: true,
    modal: true,
    height: 200,
    width: 300,
    layout: 'fit',
    items: {
        xtype: 'form',
        border: false,
        margin: 5,
        // The fields
        defaultType: 'textfield',
        items: [{
            fieldLabel: 'Name',
            name: 'name',
            allowBlank: false
        }, {
            fieldLabel: 'Description',
            name: 'desc',
            allowBlank: false
        }, {
            xtype: 'combo',
            fieldLabel: 'Choose Status',
            store: statuses,
            queryMode: 'local',
            displayField: 'name',
            valueField: 'name',
            name: 'status',
            editable: false,
            allowBlank: false
        }],

        // Reset and Submit buttons
        buttons: [{
            text: 'Reset',
            handler: function () {
                this.up('form').getForm().reset();
            },
            listeners: {
                beforerender: function (me) {
                    if (me.up('window').config.editMode) me.disable();
            }   }
        }, {
            text: 'Save',
            formBind: true, //only enabled once the form is valid
            disabled: true,
            handler: function () {
                var form = this.up('form'),
                    data = form.getValues(),
                    arrMem = this.up('window').config.arrMem,
                    memStore = this.up('window').config.memStore,
                    editMode = this.up('window').config.editMode,
                    curId;
                if (editMode) {
                    curId = this.up('window').config.bookId; 
                    arrMem[curId][3] = data.status;
                } else {
                    curId = arrMem.length ? Ext.Array.max(arrMem, (a, b) => a[0] - b[0] < 0 ? -1 : 0)[0] + 1 : 1;
                    arrMem.push([curId,
                        data.name,
                        data.desc,
                        data.status
                    ]);
                }
                memStore.reload();
                localStorage.setItem('book-shelf', JSON.stringify(arrMem));

                if (form.getForm().isValid()) {
                    var win = this.up('window').destroy();
                }
            }
        }]
    },
    listeners: {
        beforerender: function (me) {
            if (me.config.editMode) {
                me.down('form').items.items[0].setEditable(false);
                me.down('form').items.items[1].setEditable(false);
                me.down('form').items.items[0].setValue ( me.config.arrMem[me.config.bookId][1]);
                me.down('form').items.items[1].setValue ( me.config.arrMem[me.config.bookId][2]);
                me.down('form').items.items[2].setValue ( me.config.arrMem[me.config.bookId][3]);
            }
        }
    }
});
