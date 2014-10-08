/**
 * Pager, lister, filter of the table
 * @author Eduardo Rafael Correa de Souza
 * @param {object} opt
 */
$.fn.pager = function(opt) {

    var options = $.extend({
        columns: [
            {name: 'name', label: 'Nome'},
            {name: 'email', label: 'Email'}
        ],
        sorter: {
            name: false,
            order: false
        },
        pk: '',
        filter: '',
        url: '',
        next: 'icon-arrow-right-2',
        prev: 'icon-arrow-left-2',
        asc: 'icon-arrow-up-2',
        desc: 'icon-arrow-down-2'
    }, opt);

    /**
     * Objeto que irá conter a tabela
     * @type @call;$
     */
    var obj = $(this);

    /**
     * Página atual
     * @type Number
     */
    var curpage = 1;

    /**
     * Objeto da tabela
     * @type @call;$
     */
    var tableObj = $('<table/>');
    var ctrl = false;

    $(obj).append(tableObj);

    /**
     * cria os nomes das colinas
     * @returns {$}
     */
    var _header = function() {
        var theadObj = $('<thead/>');
        var trObj = $('<tr/>');
        var td, columnObj;
        for (var i in options.columns) {
            columnObj = options.columns[i];
            td = $('<th/>');
            $(td).attr("rel", columnObj.name).attr("rel-label", columnObj.label)
                    .html(columnObj.label).click(function() {
                //faz a order
                var i = $('<i/>').addClass(options.asc);
                var span = $('<span/>').html($(this).attr('rel-label'));
                options.sorter.name = $(this).attr('rel');
                options.sorter.order = 'ASC';
                if ($(this).find('i').length > 0) {
                    if ($(this).find('i').hasClass(options.asc)) {
                        options.sorter.order = 'DESC';
                        $(i).removeClass(options.asc).addClass(options.desc);
                    }
                }
                $('th',tableObj).find('i').remove();
                $(this).html('');
                $(this).append(i, span);
                _load();
            });
            trObj.append(td);
        }
        theadObj.append(trObj);
        return theadObj;
    };

    /**
     * Cria o corpo apartir do json
     * @param {object} jsondata
     * @returns {$}
     */
    var _body = function(jsondata) {
        var tbodyObj = $('<tbody/>');
        var trObj, tdObj, i, ii, arrData;
        for (i in jsondata) {
            arrData = jsondata[i];
            trObj = $('<tr/>');
            $(trObj).attr('rel', arrData[options.pk]);
            $(trObj).addClass((i % 2 === 0) ? 'even' : 'odd');
            for (ii in options.columns) {
                tdObj = $('<td/>');
                $(tdObj).html(arrData[options.columns[ii].name]);
                $(trObj).append(tdObj);
            }
            tbodyObj.append(trObj);
        }
        return tbodyObj;
    };

    /**
     * Cria os comandos das páginas
     * @param {type} jsondata
     * @returns {jQuery}
     */
    var _createCommanders = function(jsondata) {
        $(obj).find('.jqpager-commanders').remove();
        var div = $('<div/>').addClass('jqpager-commanders');
        if (jsondata !== undefined) {
            //ul principal
            var ulActions = $("<ul />");

            //cria as LI's
            var liprev = $("<li/>");
            var licurrent = $("<li/>");
            var linext = $("<li/>");
            var liInfo = $("<li/>").html('página de ' + jsondata.total + ' páginas');

            //cria os icones
            var iconPrev = $('<i/>').addClass(options.prev).click(_prev);
            var iconNext = $('<i/>').addClass(options.next).click(_next);
            var inputCurrent = $('<input/>').addClass('jqpager-curpage').html(curpage).blur(function() {
                curpage = $(this).val();
                _load();
            }).keyup(function(e) {
                if (e.keyCode === 13) {
                    curpage = $(this).val();
                    _load()
                }
            }).val(curpage);

            $(liprev).append(iconPrev);
            $(licurrent).append(inputCurrent);
            $(linext).append(iconNext);

            $(ulActions).append(liprev);
            $(ulActions).append(licurrent);
            $(ulActions).append(liInfo);
            $(ulActions).append(linext);
            $(ulActions).appendTo(div);
        }
        return div;
    };

    var _prev = function() {
        curpage--;
        _load();
    }
    var _next = function() {
        curpage++;
        _load();
    }

    /**
     * Carrega as informações na tabela via ajax
     * @returns {undefined}
     */
    var _load = function() {
        var data = $(options.form).serialize();
        if (options.sorter.name) {
            if (!options.sorter.order) {
                options.sorter.order = 'ASC';
            }
            data += '&sortname=' + options.sorter.name + '&sortorder=' + options.sorter.order;
        }
        data += '&curpage=' + curpage;
        $.ajax({
            url: options.url,
            data: data,
            type: 'POST',
            dataType: 'JSON',
            success: function(json) {
                var bodyObj = _body(json.data);
                curpage = json.current;
                $(tableObj).find('tbody').remove();
                $(tableObj).append(bodyObj);
                $(obj).append(_createCommanders(json));
                _selectItem();
            }
        });
    };

    /**
     * Para seleção de linhas
     * @returns {undefined}
     */
    var _selectItem = function() {
        var tbody = $(tableObj).find('tbody');

        $('tr', tbody).click(function() {
            if ($(this).hasClass('active')) {
                if (!ctrl) {
                    $('tr', tbody).removeClass('active');
                    ;
                } else {
                    $(this).removeClass('active');
                }
            } else {
                if (!ctrl) {
                    $('tr', tbody).removeClass('active');
                }
                $(this).addClass('active');
            }
        })
    }

    /**
     * função seta se está precionada a tecla ctrl
     * @returns {undefined}
     */
    var _setCtrl = function() {
        $(document).keydown(function(e) {
            if (e.keyCode === 17) {
                ctrl = true;
            }
        }).keyup(function(e) {
            if (e.keyCode === 17) {
                ctrl = false;
            }
        });
    }

    $(options.form).submit(function() {
        _load();
        return false;
    });
    $(tableObj).append(_header()).addClass('jqpager');

    _load();
    _setCtrl();
};