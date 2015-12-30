(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("React"));
	else if(typeof define === 'function' && define.amd)
		define(["React"], factory);
	else if(typeof exports === 'object')
		exports["DataGrid"] = factory(require("React"));
	else
		root["DataGrid"] = factory(root["React"]);
})(this, function(__WEBPACK_EXTERNAL_MODULE_6__) {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(global) {'use strict';

	__webpack_require__(1).polyfill();

	var React = __webpack_require__(6);
	var assign = __webpack_require__(7);
	var LoadMask = __webpack_require__(8);
	var Region = __webpack_require__(10);

	var PaginationToolbar = React.createFactory(__webpack_require__(19));
	var Column = __webpack_require__(35);

	var PropTypes = __webpack_require__(81);
	var Wrapper = __webpack_require__(82);
	var Header = __webpack_require__(95);
	var WrapperFactory = React.createFactory(Wrapper);
	var HeaderFactory = React.createFactory(Header);
	var ResizeProxy = __webpack_require__(136);

	var findIndexByName = __webpack_require__(132);
	var group = __webpack_require__(137);

	var slice = __webpack_require__(138);
	var _getTableProps = __webpack_require__(139);
	var getGroupedRows = __webpack_require__(144);
	var renderMenu = __webpack_require__(140);

	var preventDefault = __webpack_require__(145);

	var isArray = Array.isArray;

	var SIZING_ID = '___SIZING___';

	function clamp(value, min, max) {
	    return value < min ? min : value > max ? max : value;
	}

	function signum(x) {
	    return x < 0 ? -1 : 1;
	}

	function emptyFn() {}

	function getVisibleCount(props, state) {
	    return getVisibleColumns(props, state).length;
	}

	function getVisibleColumns(props, state) {

	    var visibility = state.visibility;
	    var visibleColumns = props.columns.filter(function (c) {
	        var name = c.name;
	        var visible = c.visible;

	        if (name in visibility) {
	            visible = !!visibility[name];
	        }

	        return visible;
	    });

	    return visibleColumns;
	}

	function findColumn(columns, column) {

	    var name = typeof column === 'string' ? column : column.name;
	    var index = findIndexByName(columns, name);

	    if (~index) {
	        return columns[index];
	    }
	}

	module.exports = React.createClass({

	    displayName: 'ReactDataGrid',

	    mixins: [__webpack_require__(146), __webpack_require__(148)],

	    propTypes: {
	        loading: React.PropTypes.bool,
	        virtualRendering: React.PropTypes.bool,

	        //specify false if you don't want any column to be resizable
	        resizableColumns: React.PropTypes.bool,
	        filterable: React.PropTypes.bool,

	        //specify false if you don't want column menus to be displayed
	        withColumnMenu: React.PropTypes.bool,
	        cellEllipsis: React.PropTypes.bool,
	        sortable: React.PropTypes.bool,
	        loadMaskOverHeader: React.PropTypes.bool,
	        idProperty: React.PropTypes.string.isRequired,

	        //you can customize the column menu by specifying a factory
	        columnMenuFactory: React.PropTypes.func,
	        onDataSourceResponse: React.PropTypes.func,
	        onDataSourceSuccess: React.PropTypes.func,
	        onDataSourceError: React.PropTypes.func,

	        /**
	         * @cfg {Number/String} columnMinWidth=50
	         */
	        columnMinWidth: PropTypes.numeric,
	        scrollBy: PropTypes.numeric,
	        rowHeight: PropTypes.numeric,
	        sortInfo: PropTypes.sortInfo,
	        columns: PropTypes.column,

	        data: function data(props, name) {
	            var value = props[name];
	            if (isArray(value)) {
	                return new Error('We are deprecating the "data" array prop. Use "dataSource" instead! It can either be an array (for local data) or a remote data source (string url, promise or function)');
	            }
	        }
	    },

	    getDefaultProps: __webpack_require__(149),

	    componentDidMount: function componentDidMount() {
	        window.addEventListener('click', this.windowClickListener = this.onWindowClick);
	        // this.checkRowHeight(this.props)
	    },

	    componentWillUnmount: function componentWillUnmount() {
	        this.scroller = null;
	        window.removeEventListener('click', this.windowClickListener);
	    },

	    // checkRowHeight: function(props) {
	    //     if (this.isVirtualRendering(props)){

	    //         //if virtual rendering and no rowHeight specifed, we use
	    //         var row = this.findRowById(SIZING_ID)
	    //         var config = {}

	    //         if (row){
	    //             this.setState({
	    //                 rowHeight: config.rowHeight = row.offsetHeight
	    //             })
	    //         }

	    //         //this ensures rows are kept in view
	    //         this.updateStartIndex(props, undefined, config)
	    //     }
	    // },

	    onWindowClick: function onWindowClick(event) {
	        if (this.state.menu) {
	            this.setState({
	                menuColumn: null,
	                menu: null
	            });
	        }
	    },

	    getInitialState: function getInitialState() {

	        var props = this.props;
	        var defaultSelected = props.defaultSelected;

	        return {
	            startIndex: 0,
	            scrollLeft: 0,
	            scrollTop: 0,
	            menuColumn: null,
	            defaultSelected: defaultSelected,
	            visibility: {},
	            defaultPageSize: props.defaultPageSize,
	            defaultPage: props.defaultPage
	        };
	    },

	    updateStartIndex: function updateStartIndex() {
	        this.handleScrollTop();
	    },

	    handleScrollLeft: function handleScrollLeft(scrollLeft) {

	        this.setState({
	            scrollLeft: scrollLeft,
	            menuColumn: null
	        });
	    },

	    handleScrollTop: function handleScrollTop(scrollTop) {
	        var props = this.p;
	        var state = this.state;

	        scrollTop = scrollTop === undefined ? this.state.scrollTop : scrollTop;

	        state.menuColumn = null;

	        this.scrollTop = scrollTop;

	        if (props.virtualRendering) {

	            var prevIndex = this.state.startIndex || 0;
	            var renderStartIndex = Math.ceil(scrollTop / props.rowHeight);

	            state.startIndex = renderStartIndex;

	            // var data = this.prepareData(props)

	            // if (renderStartIndex >= data.length){
	            //     renderStartIndex = 0
	            // }

	            // state.renderStartIndex = renderStartIndex

	            // var endIndex = this.getRenderEndIndex(props, state)

	            // if (endIndex > data.length){
	            //     renderStartIndex -= data.length - endIndex
	            //     renderStartIndex = Math.max(0, renderStartIndex)

	            //     state.renderStartIndex = renderStartIndex
	            // }

	            // // console.log('scroll!');
	            // var sign = signum(renderStartIndex - prevIndex)

	            // state.topOffset = -sign * Math.ceil(scrollTop - state.renderStartIndex * this.props.rowHeight)

	            // console.log(scrollTop, sign);
	        } else {
	                state.scrollTop = scrollTop;
	            }

	        this.setState(state);
	    },

	    getRenderEndIndex: function getRenderEndIndex(props, state) {
	        var startIndex = state.startIndex;
	        var rowCount = props.rowCountBuffer;
	        var length = props.data.length;

	        if (state.groupData) {
	            length += state.groupData.groupsCount;
	        }

	        if (!rowCount) {
	            var maxHeight;
	            if (props.style && typeof props.style.height === 'number') {
	                maxHeight = props.style.height;
	            } else {
	                maxHeight = window.screen.height;
	            }
	            rowCount = Math.floor(maxHeight / props.rowHeight);
	        }

	        var endIndex = startIndex + rowCount;

	        if (endIndex > length - 1) {
	            endIndex = length;
	        }

	        return endIndex;
	    },

	    onDropColumn: function onDropColumn(index, dropIndex) {
	        ;(this.props.onColumnOrderChange || emptyFn)(index, dropIndex);
	    },

	    toggleColumn: function toggleColumn(props, column) {

	        var visible = column.visible;
	        var visibility = this.state.visibility;

	        if (column.name in visibility) {
	            visible = visibility[column.name];
	        }

	        column = findColumn(this.props.columns, column);

	        if (visible && getVisibleCount(props, this.state) === 1) {
	            return;
	        }

	        var onHide = this.props.onColumnHide || emptyFn;
	        var onShow = this.props.onColumnShow || emptyFn;

	        visible ? onHide(column) : onShow(column);

	        var onChange = this.props.onColumnVisibilityChange || emptyFn;

	        onChange(column, !visible);

	        if (column.visible == null && column.hidden == null) {
	            var visibility = this.state.visibility;

	            visibility[column.name] = !visible;

	            this.cleanCache();
	            this.setState({});
	        }
	    },

	    cleanCache: function cleanCache() {
	        //so grouped rows are re-rendered
	        delete this.groupedRows;

	        //clear row cache
	        this.rowCache = {};
	    },

	    showMenu: function showMenu(menu, state) {

	        state = state || {};
	        state.menu = menu;

	        if (this.state.menu) {
	            this.setState({
	                menu: null,
	                menuColumn: null
	            });
	        }

	        setTimeout((function () {
	            //since menu is hidden on click on window,
	            //show it in a timeout, after the click event has reached the window
	            this.setState(state);
	        }).bind(this), 0);
	    },

	    prepareHeader: function prepareHeader(props, state) {

	        var allColumns = props.columns;
	        var columns = getVisibleColumns(props, state);

	        return (props.headerFactory || HeaderFactory)({
	            scrollLeft: state.scrollLeft,
	            resizing: state.resizing,
	            columns: columns,
	            allColumns: allColumns,
	            columnVisibility: state.visibility,
	            cellPadding: props.headerPadding || props.cellPadding,
	            filterIconColor: props.filterIconColor,
	            menuIconColor: props.menuIconColor,
	            menuIcon: props.menuIcon,
	            filterIcon: props.filterIcon,
	            scrollbarSize: props.scrollbarSize,
	            sortInfo: props.sortInfo,
	            resizableColumns: props.resizableColumns,
	            reorderColumns: props.reorderColumns,
	            filterable: props.filterable,
	            withColumnMenu: props.withColumnMenu,
	            sortable: props.sortable,

	            onDropColumn: this.onDropColumn,
	            onSortChange: props.onSortChange,
	            onColumnResizeDragStart: this.onColumnResizeDragStart,
	            onColumnResizeDrag: this.onColumnResizeDrag,
	            onColumnResizeDrop: this.onColumnResizeDrop,

	            toggleColumn: this.toggleColumn.bind(this, props),
	            showMenu: this.showMenu,
	            filterMenuFactory: this.filterMenuFactory,
	            menuColumn: state.menuColumn,
	            columnMenuFactory: props.columnMenuFactory

	        });
	    },

	    prepareFooter: function prepareFooter(props, state) {
	        return (props.footerFactory || React.DOM.div)({
	            className: 'z-footer-wrapper'
	        });
	    },

	    prepareRenderProps: function prepareRenderProps(props) {

	        var result = {};
	        var list = {
	            className: true,
	            style: true
	        };

	        Object.keys(props).forEach(function (name) {
	            // if (list[name] || name.indexOf('data-') == 0 || name.indexOf('on') === 0){
	            if (list[name]) {
	                result[name] = props[name];
	            }
	        });

	        return result;
	    },

	    render: function render() {

	        var props = this.prepareProps(this.props, this.state);

	        this.p = props;

	        this.data = props.data;
	        this.dataSource = props.dataSource;

	        var header = this.prepareHeader(props, this.state);
	        var wrapper = this.prepareWrapper(props, this.state);
	        var footer = this.prepareFooter(props, this.state);
	        var resizeProxy = this.prepareResizeProxy(props, this.state);

	        var renderProps = this.prepareRenderProps(props);

	        var menuProps = {
	            columns: props.columns,
	            menu: this.state.menu
	        };

	        var loadMask;

	        if (props.loadMaskOverHeader) {
	            loadMask = React.createElement(LoadMask, { visible: props.loading });
	        }

	        var paginationToolbar;

	        if (props.pagination) {
	            var page = props.page;
	            var minPage = props.minPage;
	            var maxPage = props.maxPage;

	            var paginationToolbarFactory = props.paginationFactory || PaginationToolbar;
	            var paginationProps = assign({
	                dataSourceCount: props.dataSourceCount,
	                page: page,
	                pageSize: props.pageSize,
	                minPage: minPage,
	                maxPage: maxPage,
	                reload: this.reload,
	                onPageChange: this.gotoPage,
	                onPageSizeChange: this.setPageSize,
	                border: props.style.border
	            }, props.paginationToolbarProps);

	            paginationToolbar = paginationToolbarFactory(paginationProps);

	            if (paginationToolbar === undefined) {
	                paginationToolbar = PaginationToolbar(paginationProps);
	            }
	        }

	        var topToolbar;
	        var bottomToolbar;

	        if (paginationToolbar) {
	            if (paginationToolbar.props.position == 'top') {
	                topToolbar = paginationToolbar;
	            } else {
	                bottomToolbar = paginationToolbar;
	            }
	        }

	        var result = React.createElement(
	            'div',
	            renderProps,
	            topToolbar,
	            React.createElement(
	                'div',
	                { className: 'z-inner' },
	                header,
	                wrapper,
	                footer,
	                resizeProxy
	            ),
	            loadMask,
	            renderMenu(menuProps),
	            bottomToolbar
	        );

	        return result;
	    },

	    getTableProps: function getTableProps(props, state) {
	        var table;
	        var rows;

	        if (props.groupBy) {
	            rows = this.groupedRows = this.groupedRows || getGroupedRows(props, state.groupData);
	            rows = slice(rows, props);
	        }

	        table = _getTableProps.call(this, props, rows);

	        return table;
	    },

	    handleVerticalScrollOverflow: function handleVerticalScrollOverflow(sign, scrollTop) {

	        var props = this.p;
	        var page = props.page;

	        if (this.isValidPage(page + sign, props)) {
	            this.gotoPage(page + sign);
	        }
	    },

	    fixHorizontalScrollbar: function fixHorizontalScrollbar() {
	        var scroller = this.scroller;

	        if (scroller) {
	            scroller.fixHorizontalScrollbar();
	        }
	    },

	    onWrapperMount: function onWrapperMount(wrapper, scroller) {
	        this.scroller = scroller;
	    },

	    prepareWrapper: function prepareWrapper(props, state) {
	        var virtualRendering = props.virtualRendering;

	        var data = props.data;
	        var scrollTop = state.scrollTop;
	        var startIndex = state.startIndex;
	        var endIndex = virtualRendering ? this.getRenderEndIndex(props, state) : 0;

	        var renderCount = virtualRendering ? endIndex + 1 - startIndex : data.length;

	        var totalLength = state.groupData ? data.length + state.groupData.groupsCount : data.length;

	        if (props.virtualRendering) {
	            scrollTop = startIndex * props.rowHeight;
	        }

	        // var topLoader
	        // var bottomLoader
	        // var loadersSize = 0

	        // if (props.virtualPagination){

	        //     if (props.page < props.maxPage){
	        //         loadersSize += 2 * props.rowHeight
	        //         bottomLoader = <div style={{height: 2 * props.rowHeight, position: 'relative', width: props.columnFlexCount? 'calc(100% - ' + props.scrollbarSize + ')': props.minRowWidth - props.scrollbarSize}}>
	        //             <LoadMask visible={true} style={{background: 'rgba(128, 128, 128, 0.17)'}}/>
	        //         </div>
	        //     }

	        //     if (props.page > props.minPage){
	        //         loadersSize += 2 * props.rowHeight
	        //         topLoader = <div style={{height: 2 * props.rowHeight, position: 'relative', width: props.columnFlexCount? 'calc(100% - ' + props.scrollbarSize + ')': props.minRowWidth - props.scrollbarSize}}>
	        //             <LoadMask visible={true} style={{background: 'rgba(128, 128, 128, 0.17)'}}/>
	        //         </div>
	        //     }
	        // }

	        var wrapperProps = assign({
	            ref: 'wrapper',
	            onMount: this.onWrapperMount,
	            scrollLeft: state.scrollLeft,
	            scrollTop: scrollTop,
	            topOffset: state.topOffset,
	            startIndex: startIndex,
	            totalLength: totalLength,
	            renderCount: renderCount,
	            endIndex: endIndex,

	            allColumns: props.columns,

	            onScrollLeft: this.handleScrollLeft,
	            onScrollTop: this.handleScrollTop,
	            // onScrollOverflow: props.virtualPagination? this.handleVerticalScrollOverflow: null,

	            menu: state.menu,
	            menuColumn: state.menuColumn,
	            showMenu: this.showMenu,

	            // cellFactory     : props.cellFactory,
	            // rowStyle        : props.rowStyle,
	            // rowClassName    : props.rowClassName,
	            // rowContextMenu  : props.rowContextMenu,

	            // topLoader: topLoader,
	            // bottomLoader: bottomLoader,
	            // loadersSize: loadersSize,

	            // onRowClick: this.handleRowClick,
	            selected: props.selected == null ? state.defaultSelected : props.selected
	        }, props);

	        wrapperProps.columns = getVisibleColumns(props, state);
	        wrapperProps.tableProps = this.getTableProps(wrapperProps, state);

	        return (props.WrapperFactory || WrapperFactory)(wrapperProps);
	    },

	    handleRowClick: function handleRowClick(rowProps, event) {
	        if (this.props.onRowClick) {
	            this.props.onRowClick(rowProps.data, rowProps, event);
	        }

	        this.handleSelection(rowProps, event);
	    },

	    prepareProps: function prepareProps(thisProps, state) {
	        var props = assign({}, thisProps);

	        props.loading = this.prepareLoading(props);
	        props.data = this.prepareData(props);
	        props.dataSource = this.prepareDataSource(props);
	        props.empty = !props.data.length;

	        props.rowHeight = this.prepareRowHeight(props);
	        props.virtualRendering = this.isVirtualRendering(props);

	        props.filterable = this.prepareFilterable(props);
	        props.resizableColumns = this.prepareResizableColumns(props);
	        props.reorderColumns = this.prepareReorderColumns(props);

	        this.prepareClassName(props);
	        props.style = this.prepareStyle(props);

	        this.preparePaging(props, state);
	        this.prepareColumns(props, state);

	        props.minRowWidth = props.totalColumnWidth + props.scrollbarSize;

	        return props;
	    },

	    prepareLoading: function prepareLoading(props) {
	        var showLoadMask = props.showLoadMask || !this.isMounted(); //ismounted check for initial load
	        return props.loading == null ? showLoadMask && this.state.defaultLoading : props.loading;
	    },

	    preparePaging: function preparePaging(props, state) {
	        props.pagination = this.preparePagination(props);

	        if (props.pagination) {
	            props.pageSize = this.preparePageSize(props);
	            props.dataSourceCount = this.prepareDataSourceCount(props);

	            props.minPage = 1;
	            props.maxPage = Math.ceil((props.dataSourceCount || 1) / props.pageSize);
	            props.page = clamp(this.preparePage(props), props.minPage, props.maxPage);
	        }
	    },

	    preparePagination: function preparePagination(props) {
	        return props.pagination === false ? false : !!props.pageSize || !!props.paginationFactory || this.isRemoteDataSource(props);
	    },

	    prepareDataSourceCount: function prepareDataSourceCount(props) {
	        return props.dataSourceCount == null ? this.state.defaultDataSourceCount : props.dataSourceCount;
	    },

	    preparePageSize: function preparePageSize(props) {
	        return props.pageSize == null ? this.state.defaultPageSize : props.pageSize;
	    },

	    preparePage: function preparePage(props) {
	        return props.page == null ? this.state.defaultPage : props.page;
	    },
	    /**
	     * Returns true if in the current configuration,
	     * the datagrid should load its data remotely.
	     *
	     * @param  {Object}  [props] Optional. If not given, this.props will be used
	     * @return {Boolean}
	     */
	    isRemoteDataSource: function isRemoteDataSource(props) {
	        props = props || this.props;

	        return props.dataSource && !isArray(props.dataSource);
	    },

	    prepareDataSource: function prepareDataSource(props) {
	        var dataSource = props.dataSource;

	        if (isArray(dataSource)) {
	            dataSource = null;
	        }

	        return dataSource;
	    },

	    prepareData: function prepareData(props) {

	        var data = null;

	        if (isArray(props.data)) {
	            data = props.data;
	        }

	        if (isArray(props.dataSource)) {
	            data = props.dataSource;
	        }

	        data = data == null ? this.state.defaultData : data;

	        if (!isArray(data)) {
	            data = [];
	        }

	        return data;
	    },

	    prepareFilterable: function prepareFilterable(props) {
	        if (props.filterable === false) {
	            return false;
	        }

	        return props.filterable || !!props.onFilter;
	    },

	    prepareResizableColumns: function prepareResizableColumns(props) {
	        if (props.resizableColumns === false) {
	            return false;
	        }

	        return props.resizableColumns || !!props.onColumnResize;
	    },

	    prepareReorderColumns: function prepareReorderColumns(props) {
	        if (props.reorderColumns === false) {
	            return false;
	        }

	        return props.reorderColumns || !!props.onColumnOrderChange;
	    },

	    isVirtualRendering: function isVirtualRendering(props) {
	        props = props || this.props;

	        return props.virtualRendering || props.rowHeight != null;
	    },

	    prepareRowHeight: function prepareRowHeight() {
	        return this.props.rowHeight == null ? this.state.rowHeight : this.props.rowHeight;
	    },

	    groupData: function groupData(props) {
	        if (props.groupBy) {
	            var data = this.prepareData(props);

	            this.setState({
	                groupData: group(data, props.groupBy)
	            });

	            delete this.groupedRows;
	        }
	    },

	    isValidPage: function isValidPage(page, props) {
	        return page >= 1 && page <= this.getMaxPage(props);
	    },

	    getMaxPage: function getMaxPage(props) {
	        props = props || this.props;

	        var count = this.prepareDataSourceCount(props) || 1;
	        var pageSize = this.preparePageSize(props);

	        return Math.ceil(count / pageSize);
	    },

	    reload: function reload() {
	        if (this.dataSource) {
	            return this.loadDataSource(this.dataSource, this.props);
	        }
	    },

	    clampPage: function clampPage(page) {
	        return clamp(page, 1, this.getMaxPage(this.props));
	    },

	    setPageSize: function setPageSize(pageSize) {

	        var stateful;
	        var newPage = this.preparePage(this.props);
	        var newState = {};

	        if (typeof this.props.onPageSizeChange == 'function') {
	            this.props.onPageSizeChange(pageSize, this.p);
	        }

	        if (this.props.pageSize == null) {
	            stateful = true;
	            this.state.defaultPageSize = pageSize;
	            newState.defaultPageSize = pageSize;
	        }

	        if (!this.isValidPage(newPage, this.props)) {

	            newPage = this.clampPage(newPage);

	            if (typeof this.props.onPageChange == 'function') {
	                this.props.onPageChange(newPage);
	            }

	            if (this.props.page == null) {
	                stateful = true;
	                this.state.defaultPage = newPage;
	                newState.defaultPage = newPage;
	            }
	        }

	        if (stateful) {
	            this.reload();
	            this.setState(newState);
	        }
	    },

	    gotoPage: function gotoPage(page) {
	        if (typeof this.props.onPageChange == 'function') {
	            this.props.onPageChange(page);
	        } else {
	            this.state.defaultPage = page;
	            var result = this.reload();
	            this.setState({
	                defaultPage: page
	            });

	            return result;
	        }
	    },

	    /**
	     * Loads remote data
	     *
	     * @param  {String/Function/Promise} [dataSource]
	     * @param  {Object} [props]
	     */
	    loadDataSource: function loadDataSource(dataSource, props) {
	        props = props || this.props;

	        if (!arguments.length) {
	            dataSource = props.dataSource;
	        }

	        var dataSourceQuery = {};

	        if (props.sortInfo) {
	            dataSourceQuery.sortInfo = props.sortInfo;
	        }

	        var pagination = this.preparePagination(props);
	        var pageSize;
	        var page;

	        if (pagination) {
	            pageSize = this.preparePageSize(props);
	            page = this.preparePage(props);

	            assign(dataSourceQuery, {
	                pageSize: pageSize,
	                page: page,
	                skip: (page - 1) * pageSize
	            });
	        }

	        if (typeof dataSource == 'function') {
	            dataSource = dataSource(dataSourceQuery, props);
	        }

	        if (typeof dataSource == 'string') {
	            var fetch = this.props.fetch || global.fetch;

	            var keys = Object.keys(dataSourceQuery);
	            if (props.appendDataSourceQueryParams && keys.length) {
	                //dataSource was initially passed as a string
	                //so we append quey params
	                dataSource += '?' + keys.map(function (param) {
	                    return param + '=' + JSON.stringify(dataSourceQuery[param]);
	                }).join('&');
	            }

	            dataSource = fetch(dataSource);
	        }

	        if (dataSource && dataSource.then) {

	            if (props.onDataSourceResponse) {
	                dataSource.then(props.onDataSourceResponse, props.onDataSourceResponse);
	            } else {
	                this.setState({
	                    defaultLoading: true
	                });

	                var errorFn = (function (err) {
	                    if (props.onDataSourceError) {
	                        props.onDataSourceError(err);
	                    }

	                    this.setState({
	                        defaultLoading: false
	                    });
	                }).bind(this);

	                var noCatchFn = dataSource['catch'] ? null : errorFn;

	                dataSource = dataSource.then(function (response) {
	                    return response && typeof response.json == 'function' ? response.json() : response;
	                }).then((function (json) {

	                    if (props.onDataSourceSuccess) {
	                        props.onDataSourceSuccess(json);
	                        this.setState({
	                            defaultLoading: false
	                        });
	                        return;
	                    }

	                    var info;
	                    if (typeof props.getDataSourceInfo == 'function') {
	                        info = props.getDataSourceInfo(json);
	                    }

	                    var data = info ? info.data : Array.isArray(json) ? json : json.data;

	                    var count = info ? info.count : json.count != null ? json.count : null;

	                    var newState = {
	                        defaultData: data,
	                        defaultLoading: false
	                    };
	                    if (props.groupBy) {
	                        newState.groupData = group(data, props.groupBy);
	                        delete this.groupedRows;
	                    }

	                    if (count != null) {
	                        newState.defaultDataSourceCount = count;
	                    }

	                    this.setState(newState);
	                }).bind(this), noCatchFn);

	                if (dataSource['catch']) {
	                    dataSource['catch'](errorFn);
	                }
	            }

	            if (props.onDataSourceLoaded) {
	                dataSource.then(props.onDataSourceLoaded);
	            }
	        }

	        return dataSource;
	    },

	    componentWillMount: function componentWillMount() {
	        this.rowCache = {};
	        this.groupData(this.props);

	        if (this.isRemoteDataSource(this.props)) {
	            this.loadDataSource(this.props.dataSource, this.props);
	        }
	    },

	    componentWillReceiveProps: function componentWillReceiveProps(nextProps) {
	        this.rowCache = {};
	        this.groupData(nextProps);

	        if (this.isRemoteDataSource(nextProps)) {
	            var otherPage = this.props.page != nextProps.page;
	            var otherPageSize = this.props.pageSize != nextProps.pageSize;

	            if (nextProps.reload || otherPage || otherPageSize) {
	                this.loadDataSource(nextProps.dataSource, nextProps);
	            }
	        }
	    },

	    prepareStyle: function prepareStyle(props) {
	        var style = {};

	        assign(style, props.defaultStyle, props.style);

	        return style;
	    },

	    prepareClassName: function prepareClassName(props) {
	        props.className = props.className || '';
	        props.className += ' ' + props.defaultClassName;

	        if (props.cellEllipsis) {
	            props.className += ' ' + props.cellEllipsisCls;
	        }

	        if (props.styleAlternateRows) {
	            props.className += ' ' + props.styleAlternateRowsCls;
	        }

	        if (props.showCellBorders) {
	            var cellBordersCls = props.showCellBorders === true ? props.showCellBordersCls + '-horizontal ' + props.showCellBordersCls + '-vertical' : props.showCellBordersCls + '-' + props.showCellBorders;

	            props.className += ' ' + cellBordersCls;
	        }

	        if (props.withColumnMenu) {
	            props.className += ' ' + props.withColumnMenuCls;
	        }

	        if (props.empty) {
	            props.className += ' ' + props.emptyCls;
	        }
	    },

	    ///////////////////////////////////////
	    ///
	    /// Code dealing with preparing columns
	    ///
	    ///////////////////////////////////////
	    prepareColumns: function prepareColumns(props, state) {
	        props.columns = props.columns.map(function (col, index) {
	            col = Column(col, props);
	            col.index = index;
	            return col;
	        }, this);

	        this.prepareColumnSizes(props, state);

	        props.columns.forEach(this.prepareColumnStyle.bind(this, props));
	    },

	    prepareColumnStyle: function prepareColumnStyle(props, column) {
	        var style = column.sizeStyle = {};

	        column.style = assign({}, column.style);
	        column.textAlign = column.textAlign || column.style.textAlign;

	        var minWidth = column.minWidth || props.columnMinWidth;

	        style.minWidth = minWidth;

	        if (column.flexible) {
	            style.flex = column.flex || 1;
	        } else {
	            style.width = column.width;
	            style.minWidth = column.width;
	        }
	    },

	    prepareColumnSizes: function prepareColumnSizes(props, state) {

	        var visibleColumns = getVisibleColumns(props, state);
	        var totalWidth = 0;
	        var flexCount = 0;

	        visibleColumns.forEach(function (column) {
	            column.minWidth = column.minWidth || props.columnMinWidth;

	            if (!column.flexible) {
	                totalWidth += column.width;
	                return 0;
	            } else if (column.minWidth) {
	                totalWidth += column.minWidth;
	            }

	            flexCount++;
	        }, this);

	        props.columnFlexCount = flexCount;
	        props.totalColumnWidth = totalWidth;
	    },

	    prepareResizeProxy: function prepareResizeProxy(props, state) {
	        return React.createElement(ResizeProxy, { ref: 'resizeProxy', active: state.resizing });
	    },

	    onColumnResizeDragStart: function onColumnResizeDragStart(config) {

	        var domNode = this.getDOMNode();
	        var region = Region.from(domNode);

	        this.resizeProxyLeft = config.resizeProxyLeft - region.left;

	        this.setState({
	            resizing: true,
	            resizeOffset: this.resizeProxyLeft
	        });
	    },

	    onColumnResizeDrag: function onColumnResizeDrag(config) {
	        this.refs.resizeProxy.setState({
	            offset: this.resizeProxyLeft + config.resizeProxyDiff
	        });
	    },

	    onColumnResizeDrop: function onColumnResizeDrop(config, resizeInfo) {

	        var horizScrollbar = this.refs.wrapper.refs.horizScrollbar;

	        if (horizScrollbar && this.state.scrollLeft) {

	            setTimeout((function () {
	                //FF needs this, since it does not trigger scroll event when scrollbar dissapears
	                //so we might end up with grid content not visible (to the left)
	                var domNode = React.findDOMNode(horizScrollbar);
	                if (domNode && !domNode.scrollLeft) {
	                    this.handleScrollLeft(0);
	                }
	            }).bind(this), 1);
	        }

	        var props = this.props;
	        var columns = props.columns;

	        var onColumnResize = props.onColumnResize || emptyFn;
	        var first = resizeInfo[0];

	        var firstCol = findColumn(columns, first.name);
	        var firstSize = first.size;

	        var second = resizeInfo[1];
	        var secondCol = second ? findColumn(columns, second.name) : undefined;
	        var secondSize = second ? second.size : undefined;

	        //if defaultWidth specified, update it
	        if (firstCol.width == null && firstCol.defaultWidth) {
	            firstCol.defaultWidth = firstSize;
	        }

	        if (secondCol && secondCol.width == null && secondCol.defaultWidth) {
	            secondCol.defaultWidth = secondSize;
	        }

	        this.setState(config);

	        onColumnResize(firstCol, firstSize, secondCol, secondSize);
	    }
	});
	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	var require;var __WEBPACK_AMD_DEFINE_RESULT__;/* WEBPACK VAR INJECTION */(function(process, setImmediate, global, module) {/*!
	 * @overview es6-promise - a tiny implementation of Promises/A+.
	 * @copyright Copyright (c) 2014 Yehuda Katz, Tom Dale, Stefan Penner and contributors (Conversion to ES6 API by Jake Archibald)
	 * @license   Licensed under MIT license
	 *            See https://raw.githubusercontent.com/jakearchibald/es6-promise/master/LICENSE
	 * @version   2.3.0
	 */

	(function() {
	    "use strict";
	    function lib$es6$promise$utils$$objectOrFunction(x) {
	      return typeof x === 'function' || (typeof x === 'object' && x !== null);
	    }

	    function lib$es6$promise$utils$$isFunction(x) {
	      return typeof x === 'function';
	    }

	    function lib$es6$promise$utils$$isMaybeThenable(x) {
	      return typeof x === 'object' && x !== null;
	    }

	    var lib$es6$promise$utils$$_isArray;
	    if (!Array.isArray) {
	      lib$es6$promise$utils$$_isArray = function (x) {
	        return Object.prototype.toString.call(x) === '[object Array]';
	      };
	    } else {
	      lib$es6$promise$utils$$_isArray = Array.isArray;
	    }

	    var lib$es6$promise$utils$$isArray = lib$es6$promise$utils$$_isArray;
	    var lib$es6$promise$asap$$len = 0;
	    var lib$es6$promise$asap$$toString = {}.toString;
	    var lib$es6$promise$asap$$vertxNext;
	    var lib$es6$promise$asap$$customSchedulerFn;

	    var lib$es6$promise$asap$$asap = function asap(callback, arg) {
	      lib$es6$promise$asap$$queue[lib$es6$promise$asap$$len] = callback;
	      lib$es6$promise$asap$$queue[lib$es6$promise$asap$$len + 1] = arg;
	      lib$es6$promise$asap$$len += 2;
	      if (lib$es6$promise$asap$$len === 2) {
	        // If len is 2, that means that we need to schedule an async flush.
	        // If additional callbacks are queued before the queue is flushed, they
	        // will be processed by this flush that we are scheduling.
	        if (lib$es6$promise$asap$$customSchedulerFn) {
	          lib$es6$promise$asap$$customSchedulerFn(lib$es6$promise$asap$$flush);
	        } else {
	          lib$es6$promise$asap$$scheduleFlush();
	        }
	      }
	    }

	    function lib$es6$promise$asap$$setScheduler(scheduleFn) {
	      lib$es6$promise$asap$$customSchedulerFn = scheduleFn;
	    }

	    function lib$es6$promise$asap$$setAsap(asapFn) {
	      lib$es6$promise$asap$$asap = asapFn;
	    }

	    var lib$es6$promise$asap$$browserWindow = (typeof window !== 'undefined') ? window : undefined;
	    var lib$es6$promise$asap$$browserGlobal = lib$es6$promise$asap$$browserWindow || {};
	    var lib$es6$promise$asap$$BrowserMutationObserver = lib$es6$promise$asap$$browserGlobal.MutationObserver || lib$es6$promise$asap$$browserGlobal.WebKitMutationObserver;
	    var lib$es6$promise$asap$$isNode = typeof process !== 'undefined' && {}.toString.call(process) === '[object process]';

	    // test for web worker but not in IE10
	    var lib$es6$promise$asap$$isWorker = typeof Uint8ClampedArray !== 'undefined' &&
	      typeof importScripts !== 'undefined' &&
	      typeof MessageChannel !== 'undefined';

	    // node
	    function lib$es6$promise$asap$$useNextTick() {
	      var nextTick = process.nextTick;
	      // node version 0.10.x displays a deprecation warning when nextTick is used recursively
	      // setImmediate should be used instead instead
	      var version = process.versions.node.match(/^(?:(\d+)\.)?(?:(\d+)\.)?(\*|\d+)$/);
	      if (Array.isArray(version) && version[1] === '0' && version[2] === '10') {
	        nextTick = setImmediate;
	      }
	      return function() {
	        nextTick(lib$es6$promise$asap$$flush);
	      };
	    }

	    // vertx
	    function lib$es6$promise$asap$$useVertxTimer() {
	      return function() {
	        lib$es6$promise$asap$$vertxNext(lib$es6$promise$asap$$flush);
	      };
	    }

	    function lib$es6$promise$asap$$useMutationObserver() {
	      var iterations = 0;
	      var observer = new lib$es6$promise$asap$$BrowserMutationObserver(lib$es6$promise$asap$$flush);
	      var node = document.createTextNode('');
	      observer.observe(node, { characterData: true });

	      return function() {
	        node.data = (iterations = ++iterations % 2);
	      };
	    }

	    // web worker
	    function lib$es6$promise$asap$$useMessageChannel() {
	      var channel = new MessageChannel();
	      channel.port1.onmessage = lib$es6$promise$asap$$flush;
	      return function () {
	        channel.port2.postMessage(0);
	      };
	    }

	    function lib$es6$promise$asap$$useSetTimeout() {
	      return function() {
	        setTimeout(lib$es6$promise$asap$$flush, 1);
	      };
	    }

	    var lib$es6$promise$asap$$queue = new Array(1000);
	    function lib$es6$promise$asap$$flush() {
	      for (var i = 0; i < lib$es6$promise$asap$$len; i+=2) {
	        var callback = lib$es6$promise$asap$$queue[i];
	        var arg = lib$es6$promise$asap$$queue[i+1];

	        callback(arg);

	        lib$es6$promise$asap$$queue[i] = undefined;
	        lib$es6$promise$asap$$queue[i+1] = undefined;
	      }

	      lib$es6$promise$asap$$len = 0;
	    }

	    function lib$es6$promise$asap$$attemptVertex() {
	      try {
	        var r = require;
	        var vertx = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"vertx\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));
	        lib$es6$promise$asap$$vertxNext = vertx.runOnLoop || vertx.runOnContext;
	        return lib$es6$promise$asap$$useVertxTimer();
	      } catch(e) {
	        return lib$es6$promise$asap$$useSetTimeout();
	      }
	    }

	    var lib$es6$promise$asap$$scheduleFlush;
	    // Decide what async method to use to triggering processing of queued callbacks:
	    if (lib$es6$promise$asap$$isNode) {
	      lib$es6$promise$asap$$scheduleFlush = lib$es6$promise$asap$$useNextTick();
	    } else if (lib$es6$promise$asap$$BrowserMutationObserver) {
	      lib$es6$promise$asap$$scheduleFlush = lib$es6$promise$asap$$useMutationObserver();
	    } else if (lib$es6$promise$asap$$isWorker) {
	      lib$es6$promise$asap$$scheduleFlush = lib$es6$promise$asap$$useMessageChannel();
	    } else if (lib$es6$promise$asap$$browserWindow === undefined && "function" === 'function') {
	      lib$es6$promise$asap$$scheduleFlush = lib$es6$promise$asap$$attemptVertex();
	    } else {
	      lib$es6$promise$asap$$scheduleFlush = lib$es6$promise$asap$$useSetTimeout();
	    }

	    function lib$es6$promise$$internal$$noop() {}

	    var lib$es6$promise$$internal$$PENDING   = void 0;
	    var lib$es6$promise$$internal$$FULFILLED = 1;
	    var lib$es6$promise$$internal$$REJECTED  = 2;

	    var lib$es6$promise$$internal$$GET_THEN_ERROR = new lib$es6$promise$$internal$$ErrorObject();

	    function lib$es6$promise$$internal$$selfFullfillment() {
	      return new TypeError("You cannot resolve a promise with itself");
	    }

	    function lib$es6$promise$$internal$$cannotReturnOwn() {
	      return new TypeError('A promises callback cannot return that same promise.');
	    }

	    function lib$es6$promise$$internal$$getThen(promise) {
	      try {
	        return promise.then;
	      } catch(error) {
	        lib$es6$promise$$internal$$GET_THEN_ERROR.error = error;
	        return lib$es6$promise$$internal$$GET_THEN_ERROR;
	      }
	    }

	    function lib$es6$promise$$internal$$tryThen(then, value, fulfillmentHandler, rejectionHandler) {
	      try {
	        then.call(value, fulfillmentHandler, rejectionHandler);
	      } catch(e) {
	        return e;
	      }
	    }

	    function lib$es6$promise$$internal$$handleForeignThenable(promise, thenable, then) {
	       lib$es6$promise$asap$$asap(function(promise) {
	        var sealed = false;
	        var error = lib$es6$promise$$internal$$tryThen(then, thenable, function(value) {
	          if (sealed) { return; }
	          sealed = true;
	          if (thenable !== value) {
	            lib$es6$promise$$internal$$resolve(promise, value);
	          } else {
	            lib$es6$promise$$internal$$fulfill(promise, value);
	          }
	        }, function(reason) {
	          if (sealed) { return; }
	          sealed = true;

	          lib$es6$promise$$internal$$reject(promise, reason);
	        }, 'Settle: ' + (promise._label || ' unknown promise'));

	        if (!sealed && error) {
	          sealed = true;
	          lib$es6$promise$$internal$$reject(promise, error);
	        }
	      }, promise);
	    }

	    function lib$es6$promise$$internal$$handleOwnThenable(promise, thenable) {
	      if (thenable._state === lib$es6$promise$$internal$$FULFILLED) {
	        lib$es6$promise$$internal$$fulfill(promise, thenable._result);
	      } else if (thenable._state === lib$es6$promise$$internal$$REJECTED) {
	        lib$es6$promise$$internal$$reject(promise, thenable._result);
	      } else {
	        lib$es6$promise$$internal$$subscribe(thenable, undefined, function(value) {
	          lib$es6$promise$$internal$$resolve(promise, value);
	        }, function(reason) {
	          lib$es6$promise$$internal$$reject(promise, reason);
	        });
	      }
	    }

	    function lib$es6$promise$$internal$$handleMaybeThenable(promise, maybeThenable) {
	      if (maybeThenable.constructor === promise.constructor) {
	        lib$es6$promise$$internal$$handleOwnThenable(promise, maybeThenable);
	      } else {
	        var then = lib$es6$promise$$internal$$getThen(maybeThenable);

	        if (then === lib$es6$promise$$internal$$GET_THEN_ERROR) {
	          lib$es6$promise$$internal$$reject(promise, lib$es6$promise$$internal$$GET_THEN_ERROR.error);
	        } else if (then === undefined) {
	          lib$es6$promise$$internal$$fulfill(promise, maybeThenable);
	        } else if (lib$es6$promise$utils$$isFunction(then)) {
	          lib$es6$promise$$internal$$handleForeignThenable(promise, maybeThenable, then);
	        } else {
	          lib$es6$promise$$internal$$fulfill(promise, maybeThenable);
	        }
	      }
	    }

	    function lib$es6$promise$$internal$$resolve(promise, value) {
	      if (promise === value) {
	        lib$es6$promise$$internal$$reject(promise, lib$es6$promise$$internal$$selfFullfillment());
	      } else if (lib$es6$promise$utils$$objectOrFunction(value)) {
	        lib$es6$promise$$internal$$handleMaybeThenable(promise, value);
	      } else {
	        lib$es6$promise$$internal$$fulfill(promise, value);
	      }
	    }

	    function lib$es6$promise$$internal$$publishRejection(promise) {
	      if (promise._onerror) {
	        promise._onerror(promise._result);
	      }

	      lib$es6$promise$$internal$$publish(promise);
	    }

	    function lib$es6$promise$$internal$$fulfill(promise, value) {
	      if (promise._state !== lib$es6$promise$$internal$$PENDING) { return; }

	      promise._result = value;
	      promise._state = lib$es6$promise$$internal$$FULFILLED;

	      if (promise._subscribers.length !== 0) {
	        lib$es6$promise$asap$$asap(lib$es6$promise$$internal$$publish, promise);
	      }
	    }

	    function lib$es6$promise$$internal$$reject(promise, reason) {
	      if (promise._state !== lib$es6$promise$$internal$$PENDING) { return; }
	      promise._state = lib$es6$promise$$internal$$REJECTED;
	      promise._result = reason;

	      lib$es6$promise$asap$$asap(lib$es6$promise$$internal$$publishRejection, promise);
	    }

	    function lib$es6$promise$$internal$$subscribe(parent, child, onFulfillment, onRejection) {
	      var subscribers = parent._subscribers;
	      var length = subscribers.length;

	      parent._onerror = null;

	      subscribers[length] = child;
	      subscribers[length + lib$es6$promise$$internal$$FULFILLED] = onFulfillment;
	      subscribers[length + lib$es6$promise$$internal$$REJECTED]  = onRejection;

	      if (length === 0 && parent._state) {
	        lib$es6$promise$asap$$asap(lib$es6$promise$$internal$$publish, parent);
	      }
	    }

	    function lib$es6$promise$$internal$$publish(promise) {
	      var subscribers = promise._subscribers;
	      var settled = promise._state;

	      if (subscribers.length === 0) { return; }

	      var child, callback, detail = promise._result;

	      for (var i = 0; i < subscribers.length; i += 3) {
	        child = subscribers[i];
	        callback = subscribers[i + settled];

	        if (child) {
	          lib$es6$promise$$internal$$invokeCallback(settled, child, callback, detail);
	        } else {
	          callback(detail);
	        }
	      }

	      promise._subscribers.length = 0;
	    }

	    function lib$es6$promise$$internal$$ErrorObject() {
	      this.error = null;
	    }

	    var lib$es6$promise$$internal$$TRY_CATCH_ERROR = new lib$es6$promise$$internal$$ErrorObject();

	    function lib$es6$promise$$internal$$tryCatch(callback, detail) {
	      try {
	        return callback(detail);
	      } catch(e) {
	        lib$es6$promise$$internal$$TRY_CATCH_ERROR.error = e;
	        return lib$es6$promise$$internal$$TRY_CATCH_ERROR;
	      }
	    }

	    function lib$es6$promise$$internal$$invokeCallback(settled, promise, callback, detail) {
	      var hasCallback = lib$es6$promise$utils$$isFunction(callback),
	          value, error, succeeded, failed;

	      if (hasCallback) {
	        value = lib$es6$promise$$internal$$tryCatch(callback, detail);

	        if (value === lib$es6$promise$$internal$$TRY_CATCH_ERROR) {
	          failed = true;
	          error = value.error;
	          value = null;
	        } else {
	          succeeded = true;
	        }

	        if (promise === value) {
	          lib$es6$promise$$internal$$reject(promise, lib$es6$promise$$internal$$cannotReturnOwn());
	          return;
	        }

	      } else {
	        value = detail;
	        succeeded = true;
	      }

	      if (promise._state !== lib$es6$promise$$internal$$PENDING) {
	        // noop
	      } else if (hasCallback && succeeded) {
	        lib$es6$promise$$internal$$resolve(promise, value);
	      } else if (failed) {
	        lib$es6$promise$$internal$$reject(promise, error);
	      } else if (settled === lib$es6$promise$$internal$$FULFILLED) {
	        lib$es6$promise$$internal$$fulfill(promise, value);
	      } else if (settled === lib$es6$promise$$internal$$REJECTED) {
	        lib$es6$promise$$internal$$reject(promise, value);
	      }
	    }

	    function lib$es6$promise$$internal$$initializePromise(promise, resolver) {
	      try {
	        resolver(function resolvePromise(value){
	          lib$es6$promise$$internal$$resolve(promise, value);
	        }, function rejectPromise(reason) {
	          lib$es6$promise$$internal$$reject(promise, reason);
	        });
	      } catch(e) {
	        lib$es6$promise$$internal$$reject(promise, e);
	      }
	    }

	    function lib$es6$promise$enumerator$$Enumerator(Constructor, input) {
	      var enumerator = this;

	      enumerator._instanceConstructor = Constructor;
	      enumerator.promise = new Constructor(lib$es6$promise$$internal$$noop);

	      if (enumerator._validateInput(input)) {
	        enumerator._input     = input;
	        enumerator.length     = input.length;
	        enumerator._remaining = input.length;

	        enumerator._init();

	        if (enumerator.length === 0) {
	          lib$es6$promise$$internal$$fulfill(enumerator.promise, enumerator._result);
	        } else {
	          enumerator.length = enumerator.length || 0;
	          enumerator._enumerate();
	          if (enumerator._remaining === 0) {
	            lib$es6$promise$$internal$$fulfill(enumerator.promise, enumerator._result);
	          }
	        }
	      } else {
	        lib$es6$promise$$internal$$reject(enumerator.promise, enumerator._validationError());
	      }
	    }

	    lib$es6$promise$enumerator$$Enumerator.prototype._validateInput = function(input) {
	      return lib$es6$promise$utils$$isArray(input);
	    };

	    lib$es6$promise$enumerator$$Enumerator.prototype._validationError = function() {
	      return new Error('Array Methods must be provided an Array');
	    };

	    lib$es6$promise$enumerator$$Enumerator.prototype._init = function() {
	      this._result = new Array(this.length);
	    };

	    var lib$es6$promise$enumerator$$default = lib$es6$promise$enumerator$$Enumerator;

	    lib$es6$promise$enumerator$$Enumerator.prototype._enumerate = function() {
	      var enumerator = this;

	      var length  = enumerator.length;
	      var promise = enumerator.promise;
	      var input   = enumerator._input;

	      for (var i = 0; promise._state === lib$es6$promise$$internal$$PENDING && i < length; i++) {
	        enumerator._eachEntry(input[i], i);
	      }
	    };

	    lib$es6$promise$enumerator$$Enumerator.prototype._eachEntry = function(entry, i) {
	      var enumerator = this;
	      var c = enumerator._instanceConstructor;

	      if (lib$es6$promise$utils$$isMaybeThenable(entry)) {
	        if (entry.constructor === c && entry._state !== lib$es6$promise$$internal$$PENDING) {
	          entry._onerror = null;
	          enumerator._settledAt(entry._state, i, entry._result);
	        } else {
	          enumerator._willSettleAt(c.resolve(entry), i);
	        }
	      } else {
	        enumerator._remaining--;
	        enumerator._result[i] = entry;
	      }
	    };

	    lib$es6$promise$enumerator$$Enumerator.prototype._settledAt = function(state, i, value) {
	      var enumerator = this;
	      var promise = enumerator.promise;

	      if (promise._state === lib$es6$promise$$internal$$PENDING) {
	        enumerator._remaining--;

	        if (state === lib$es6$promise$$internal$$REJECTED) {
	          lib$es6$promise$$internal$$reject(promise, value);
	        } else {
	          enumerator._result[i] = value;
	        }
	      }

	      if (enumerator._remaining === 0) {
	        lib$es6$promise$$internal$$fulfill(promise, enumerator._result);
	      }
	    };

	    lib$es6$promise$enumerator$$Enumerator.prototype._willSettleAt = function(promise, i) {
	      var enumerator = this;

	      lib$es6$promise$$internal$$subscribe(promise, undefined, function(value) {
	        enumerator._settledAt(lib$es6$promise$$internal$$FULFILLED, i, value);
	      }, function(reason) {
	        enumerator._settledAt(lib$es6$promise$$internal$$REJECTED, i, reason);
	      });
	    };
	    function lib$es6$promise$promise$all$$all(entries) {
	      return new lib$es6$promise$enumerator$$default(this, entries).promise;
	    }
	    var lib$es6$promise$promise$all$$default = lib$es6$promise$promise$all$$all;
	    function lib$es6$promise$promise$race$$race(entries) {
	      /*jshint validthis:true */
	      var Constructor = this;

	      var promise = new Constructor(lib$es6$promise$$internal$$noop);

	      if (!lib$es6$promise$utils$$isArray(entries)) {
	        lib$es6$promise$$internal$$reject(promise, new TypeError('You must pass an array to race.'));
	        return promise;
	      }

	      var length = entries.length;

	      function onFulfillment(value) {
	        lib$es6$promise$$internal$$resolve(promise, value);
	      }

	      function onRejection(reason) {
	        lib$es6$promise$$internal$$reject(promise, reason);
	      }

	      for (var i = 0; promise._state === lib$es6$promise$$internal$$PENDING && i < length; i++) {
	        lib$es6$promise$$internal$$subscribe(Constructor.resolve(entries[i]), undefined, onFulfillment, onRejection);
	      }

	      return promise;
	    }
	    var lib$es6$promise$promise$race$$default = lib$es6$promise$promise$race$$race;
	    function lib$es6$promise$promise$resolve$$resolve(object) {
	      /*jshint validthis:true */
	      var Constructor = this;

	      if (object && typeof object === 'object' && object.constructor === Constructor) {
	        return object;
	      }

	      var promise = new Constructor(lib$es6$promise$$internal$$noop);
	      lib$es6$promise$$internal$$resolve(promise, object);
	      return promise;
	    }
	    var lib$es6$promise$promise$resolve$$default = lib$es6$promise$promise$resolve$$resolve;
	    function lib$es6$promise$promise$reject$$reject(reason) {
	      /*jshint validthis:true */
	      var Constructor = this;
	      var promise = new Constructor(lib$es6$promise$$internal$$noop);
	      lib$es6$promise$$internal$$reject(promise, reason);
	      return promise;
	    }
	    var lib$es6$promise$promise$reject$$default = lib$es6$promise$promise$reject$$reject;

	    var lib$es6$promise$promise$$counter = 0;

	    function lib$es6$promise$promise$$needsResolver() {
	      throw new TypeError('You must pass a resolver function as the first argument to the promise constructor');
	    }

	    function lib$es6$promise$promise$$needsNew() {
	      throw new TypeError("Failed to construct 'Promise': Please use the 'new' operator, this object constructor cannot be called as a function.");
	    }

	    var lib$es6$promise$promise$$default = lib$es6$promise$promise$$Promise;
	    /**
	      Promise objects represent the eventual result of an asynchronous operation. The
	      primary way of interacting with a promise is through its `then` method, which
	      registers callbacks to receive either a promise's eventual value or the reason
	      why the promise cannot be fulfilled.

	      Terminology
	      -----------

	      - `promise` is an object or function with a `then` method whose behavior conforms to this specification.
	      - `thenable` is an object or function that defines a `then` method.
	      - `value` is any legal JavaScript value (including undefined, a thenable, or a promise).
	      - `exception` is a value that is thrown using the throw statement.
	      - `reason` is a value that indicates why a promise was rejected.
	      - `settled` the final resting state of a promise, fulfilled or rejected.

	      A promise can be in one of three states: pending, fulfilled, or rejected.

	      Promises that are fulfilled have a fulfillment value and are in the fulfilled
	      state.  Promises that are rejected have a rejection reason and are in the
	      rejected state.  A fulfillment value is never a thenable.

	      Promises can also be said to *resolve* a value.  If this value is also a
	      promise, then the original promise's settled state will match the value's
	      settled state.  So a promise that *resolves* a promise that rejects will
	      itself reject, and a promise that *resolves* a promise that fulfills will
	      itself fulfill.


	      Basic Usage:
	      ------------

	      ```js
	      var promise = new Promise(function(resolve, reject) {
	        // on success
	        resolve(value);

	        // on failure
	        reject(reason);
	      });

	      promise.then(function(value) {
	        // on fulfillment
	      }, function(reason) {
	        // on rejection
	      });
	      ```

	      Advanced Usage:
	      ---------------

	      Promises shine when abstracting away asynchronous interactions such as
	      `XMLHttpRequest`s.

	      ```js
	      function getJSON(url) {
	        return new Promise(function(resolve, reject){
	          var xhr = new XMLHttpRequest();

	          xhr.open('GET', url);
	          xhr.onreadystatechange = handler;
	          xhr.responseType = 'json';
	          xhr.setRequestHeader('Accept', 'application/json');
	          xhr.send();

	          function handler() {
	            if (this.readyState === this.DONE) {
	              if (this.status === 200) {
	                resolve(this.response);
	              } else {
	                reject(new Error('getJSON: `' + url + '` failed with status: [' + this.status + ']'));
	              }
	            }
	          };
	        });
	      }

	      getJSON('/posts.json').then(function(json) {
	        // on fulfillment
	      }, function(reason) {
	        // on rejection
	      });
	      ```

	      Unlike callbacks, promises are great composable primitives.

	      ```js
	      Promise.all([
	        getJSON('/posts'),
	        getJSON('/comments')
	      ]).then(function(values){
	        values[0] // => postsJSON
	        values[1] // => commentsJSON

	        return values;
	      });
	      ```

	      @class Promise
	      @param {function} resolver
	      Useful for tooling.
	      @constructor
	    */
	    function lib$es6$promise$promise$$Promise(resolver) {
	      this._id = lib$es6$promise$promise$$counter++;
	      this._state = undefined;
	      this._result = undefined;
	      this._subscribers = [];

	      if (lib$es6$promise$$internal$$noop !== resolver) {
	        if (!lib$es6$promise$utils$$isFunction(resolver)) {
	          lib$es6$promise$promise$$needsResolver();
	        }

	        if (!(this instanceof lib$es6$promise$promise$$Promise)) {
	          lib$es6$promise$promise$$needsNew();
	        }

	        lib$es6$promise$$internal$$initializePromise(this, resolver);
	      }
	    }

	    lib$es6$promise$promise$$Promise.all = lib$es6$promise$promise$all$$default;
	    lib$es6$promise$promise$$Promise.race = lib$es6$promise$promise$race$$default;
	    lib$es6$promise$promise$$Promise.resolve = lib$es6$promise$promise$resolve$$default;
	    lib$es6$promise$promise$$Promise.reject = lib$es6$promise$promise$reject$$default;
	    lib$es6$promise$promise$$Promise._setScheduler = lib$es6$promise$asap$$setScheduler;
	    lib$es6$promise$promise$$Promise._setAsap = lib$es6$promise$asap$$setAsap;
	    lib$es6$promise$promise$$Promise._asap = lib$es6$promise$asap$$asap;

	    lib$es6$promise$promise$$Promise.prototype = {
	      constructor: lib$es6$promise$promise$$Promise,

	    /**
	      The primary way of interacting with a promise is through its `then` method,
	      which registers callbacks to receive either a promise's eventual value or the
	      reason why the promise cannot be fulfilled.

	      ```js
	      findUser().then(function(user){
	        // user is available
	      }, function(reason){
	        // user is unavailable, and you are given the reason why
	      });
	      ```

	      Chaining
	      --------

	      The return value of `then` is itself a promise.  This second, 'downstream'
	      promise is resolved with the return value of the first promise's fulfillment
	      or rejection handler, or rejected if the handler throws an exception.

	      ```js
	      findUser().then(function (user) {
	        return user.name;
	      }, function (reason) {
	        return 'default name';
	      }).then(function (userName) {
	        // If `findUser` fulfilled, `userName` will be the user's name, otherwise it
	        // will be `'default name'`
	      });

	      findUser().then(function (user) {
	        throw new Error('Found user, but still unhappy');
	      }, function (reason) {
	        throw new Error('`findUser` rejected and we're unhappy');
	      }).then(function (value) {
	        // never reached
	      }, function (reason) {
	        // if `findUser` fulfilled, `reason` will be 'Found user, but still unhappy'.
	        // If `findUser` rejected, `reason` will be '`findUser` rejected and we're unhappy'.
	      });
	      ```
	      If the downstream promise does not specify a rejection handler, rejection reasons will be propagated further downstream.

	      ```js
	      findUser().then(function (user) {
	        throw new PedagogicalException('Upstream error');
	      }).then(function (value) {
	        // never reached
	      }).then(function (value) {
	        // never reached
	      }, function (reason) {
	        // The `PedgagocialException` is propagated all the way down to here
	      });
	      ```

	      Assimilation
	      ------------

	      Sometimes the value you want to propagate to a downstream promise can only be
	      retrieved asynchronously. This can be achieved by returning a promise in the
	      fulfillment or rejection handler. The downstream promise will then be pending
	      until the returned promise is settled. This is called *assimilation*.

	      ```js
	      findUser().then(function (user) {
	        return findCommentsByAuthor(user);
	      }).then(function (comments) {
	        // The user's comments are now available
	      });
	      ```

	      If the assimliated promise rejects, then the downstream promise will also reject.

	      ```js
	      findUser().then(function (user) {
	        return findCommentsByAuthor(user);
	      }).then(function (comments) {
	        // If `findCommentsByAuthor` fulfills, we'll have the value here
	      }, function (reason) {
	        // If `findCommentsByAuthor` rejects, we'll have the reason here
	      });
	      ```

	      Simple Example
	      --------------

	      Synchronous Example

	      ```javascript
	      var result;

	      try {
	        result = findResult();
	        // success
	      } catch(reason) {
	        // failure
	      }
	      ```

	      Errback Example

	      ```js
	      findResult(function(result, err){
	        if (err) {
	          // failure
	        } else {
	          // success
	        }
	      });
	      ```

	      Promise Example;

	      ```javascript
	      findResult().then(function(result){
	        // success
	      }, function(reason){
	        // failure
	      });
	      ```

	      Advanced Example
	      --------------

	      Synchronous Example

	      ```javascript
	      var author, books;

	      try {
	        author = findAuthor();
	        books  = findBooksByAuthor(author);
	        // success
	      } catch(reason) {
	        // failure
	      }
	      ```

	      Errback Example

	      ```js

	      function foundBooks(books) {

	      }

	      function failure(reason) {

	      }

	      findAuthor(function(author, err){
	        if (err) {
	          failure(err);
	          // failure
	        } else {
	          try {
	            findBoooksByAuthor(author, function(books, err) {
	              if (err) {
	                failure(err);
	              } else {
	                try {
	                  foundBooks(books);
	                } catch(reason) {
	                  failure(reason);
	                }
	              }
	            });
	          } catch(error) {
	            failure(err);
	          }
	          // success
	        }
	      });
	      ```

	      Promise Example;

	      ```javascript
	      findAuthor().
	        then(findBooksByAuthor).
	        then(function(books){
	          // found books
	      }).catch(function(reason){
	        // something went wrong
	      });
	      ```

	      @method then
	      @param {Function} onFulfilled
	      @param {Function} onRejected
	      Useful for tooling.
	      @return {Promise}
	    */
	      then: function(onFulfillment, onRejection) {
	        var parent = this;
	        var state = parent._state;

	        if (state === lib$es6$promise$$internal$$FULFILLED && !onFulfillment || state === lib$es6$promise$$internal$$REJECTED && !onRejection) {
	          return this;
	        }

	        var child = new this.constructor(lib$es6$promise$$internal$$noop);
	        var result = parent._result;

	        if (state) {
	          var callback = arguments[state - 1];
	          lib$es6$promise$asap$$asap(function(){
	            lib$es6$promise$$internal$$invokeCallback(state, child, callback, result);
	          });
	        } else {
	          lib$es6$promise$$internal$$subscribe(parent, child, onFulfillment, onRejection);
	        }

	        return child;
	      },

	    /**
	      `catch` is simply sugar for `then(undefined, onRejection)` which makes it the same
	      as the catch block of a try/catch statement.

	      ```js
	      function findAuthor(){
	        throw new Error('couldn't find that author');
	      }

	      // synchronous
	      try {
	        findAuthor();
	      } catch(reason) {
	        // something went wrong
	      }

	      // async with promises
	      findAuthor().catch(function(reason){
	        // something went wrong
	      });
	      ```

	      @method catch
	      @param {Function} onRejection
	      Useful for tooling.
	      @return {Promise}
	    */
	      'catch': function(onRejection) {
	        return this.then(null, onRejection);
	      }
	    };
	    function lib$es6$promise$polyfill$$polyfill() {
	      var local;

	      if (typeof global !== 'undefined') {
	          local = global;
	      } else if (typeof self !== 'undefined') {
	          local = self;
	      } else {
	          try {
	              local = Function('return this')();
	          } catch (e) {
	              throw new Error('polyfill failed because global object is unavailable in this environment');
	          }
	      }

	      var P = local.Promise;

	      if (P && Object.prototype.toString.call(P.resolve()) === '[object Promise]' && !P.cast) {
	        return;
	      }

	      local.Promise = lib$es6$promise$promise$$default;
	    }
	    var lib$es6$promise$polyfill$$default = lib$es6$promise$polyfill$$polyfill;

	    var lib$es6$promise$umd$$ES6Promise = {
	      'Promise': lib$es6$promise$promise$$default,
	      'polyfill': lib$es6$promise$polyfill$$default
	    };

	    /* global define:true module:true window: true */
	    if ("function" === 'function' && __webpack_require__(5)['amd']) {
	      !(__WEBPACK_AMD_DEFINE_RESULT__ = function() { return lib$es6$promise$umd$$ES6Promise; }.call(exports, __webpack_require__, exports, module), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	    } else if (typeof module !== 'undefined' && module['exports']) {
	      module['exports'] = lib$es6$promise$umd$$ES6Promise;
	    } else if (typeof this !== 'undefined') {
	      this['ES6Promise'] = lib$es6$promise$umd$$ES6Promise;
	    }

	    lib$es6$promise$polyfill$$default();
	}).call(this);


	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(2), __webpack_require__(3).setImmediate, (function() { return this; }()), __webpack_require__(4)(module)))

/***/ },
/* 2 */
/***/ function(module, exports) {

	// shim for using process in browser

	var process = module.exports = {};
	var queue = [];
	var draining = false;
	var currentQueue;
	var queueIndex = -1;

	function cleanUpNextTick() {
	    draining = false;
	    if (currentQueue.length) {
	        queue = currentQueue.concat(queue);
	    } else {
	        queueIndex = -1;
	    }
	    if (queue.length) {
	        drainQueue();
	    }
	}

	function drainQueue() {
	    if (draining) {
	        return;
	    }
	    var timeout = setTimeout(cleanUpNextTick);
	    draining = true;

	    var len = queue.length;
	    while(len) {
	        currentQueue = queue;
	        queue = [];
	        while (++queueIndex < len) {
	            if (currentQueue) {
	                currentQueue[queueIndex].run();
	            }
	        }
	        queueIndex = -1;
	        len = queue.length;
	    }
	    currentQueue = null;
	    draining = false;
	    clearTimeout(timeout);
	}

	process.nextTick = function (fun) {
	    var args = new Array(arguments.length - 1);
	    if (arguments.length > 1) {
	        for (var i = 1; i < arguments.length; i++) {
	            args[i - 1] = arguments[i];
	        }
	    }
	    queue.push(new Item(fun, args));
	    if (queue.length === 1 && !draining) {
	        setTimeout(drainQueue, 0);
	    }
	};

	// v8 likes predictible objects
	function Item(fun, array) {
	    this.fun = fun;
	    this.array = array;
	}
	Item.prototype.run = function () {
	    this.fun.apply(null, this.array);
	};
	process.title = 'browser';
	process.browser = true;
	process.env = {};
	process.argv = [];
	process.version = ''; // empty string to avoid regexp issues
	process.versions = {};

	function noop() {}

	process.on = noop;
	process.addListener = noop;
	process.once = noop;
	process.off = noop;
	process.removeListener = noop;
	process.removeAllListeners = noop;
	process.emit = noop;

	process.binding = function (name) {
	    throw new Error('process.binding is not supported');
	};

	process.cwd = function () { return '/' };
	process.chdir = function (dir) {
	    throw new Error('process.chdir is not supported');
	};
	process.umask = function() { return 0; };


/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(setImmediate, clearImmediate) {var nextTick = __webpack_require__(2).nextTick;
	var apply = Function.prototype.apply;
	var slice = Array.prototype.slice;
	var immediateIds = {};
	var nextImmediateId = 0;

	// DOM APIs, for completeness

	exports.setTimeout = function() {
	  return new Timeout(apply.call(setTimeout, window, arguments), clearTimeout);
	};
	exports.setInterval = function() {
	  return new Timeout(apply.call(setInterval, window, arguments), clearInterval);
	};
	exports.clearTimeout =
	exports.clearInterval = function(timeout) { timeout.close(); };

	function Timeout(id, clearFn) {
	  this._id = id;
	  this._clearFn = clearFn;
	}
	Timeout.prototype.unref = Timeout.prototype.ref = function() {};
	Timeout.prototype.close = function() {
	  this._clearFn.call(window, this._id);
	};

	// Does not start the time, just sets up the members needed.
	exports.enroll = function(item, msecs) {
	  clearTimeout(item._idleTimeoutId);
	  item._idleTimeout = msecs;
	};

	exports.unenroll = function(item) {
	  clearTimeout(item._idleTimeoutId);
	  item._idleTimeout = -1;
	};

	exports._unrefActive = exports.active = function(item) {
	  clearTimeout(item._idleTimeoutId);

	  var msecs = item._idleTimeout;
	  if (msecs >= 0) {
	    item._idleTimeoutId = setTimeout(function onTimeout() {
	      if (item._onTimeout)
	        item._onTimeout();
	    }, msecs);
	  }
	};

	// That's not how node.js implements it but the exposed api is the same.
	exports.setImmediate = typeof setImmediate === "function" ? setImmediate : function(fn) {
	  var id = nextImmediateId++;
	  var args = arguments.length < 2 ? false : slice.call(arguments, 1);

	  immediateIds[id] = true;

	  nextTick(function onNextTick() {
	    if (immediateIds[id]) {
	      // fn.call() is faster so we optimize for the common use-case
	      // @see http://jsperf.com/call-apply-segu
	      if (args) {
	        fn.apply(null, args);
	      } else {
	        fn.call(null);
	      }
	      // Prevent ids from leaking
	      exports.clearImmediate(id);
	    }
	  });

	  return id;
	};

	exports.clearImmediate = typeof clearImmediate === "function" ? clearImmediate : function(id) {
	  delete immediateIds[id];
	};
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(3).setImmediate, __webpack_require__(3).clearImmediate))

/***/ },
/* 4 */
/***/ function(module, exports) {

	module.exports = function(module) {
		if(!module.webpackPolyfill) {
			module.deprecate = function() {};
			module.paths = [];
			// module.parent = undefined by default
			module.children = [];
			module.webpackPolyfill = 1;
		}
		return module;
	}


/***/ },
/* 5 */
/***/ function(module, exports) {

	module.exports = function() { throw new Error("define cannot be used indirect"); };


/***/ },
/* 6 */
/***/ function(module, exports) {

	module.exports = __WEBPACK_EXTERNAL_MODULE_6__;

/***/ },
/* 7 */
/***/ function(module, exports) {

	'use strict';

	function ToObject(val) {
		if (val == null) {
			throw new TypeError('Object.assign cannot be called with null or undefined');
		}

		return Object(val);
	}

	module.exports = Object.assign || function (target, source) {
		var from;
		var keys;
		var to = ToObject(target);

		for (var s = 1; s < arguments.length; s++) {
			from = arguments[s];
			keys = Object.keys(Object(from));

			for (var i = 0; i < keys.length; i++) {
				to[keys[i]] = from[keys[i]];
			}
		}

		return to;
	};


/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	'use strict'

	var React  = __webpack_require__(6)
	var assign = __webpack_require__(7)
	var Loader = __webpack_require__(9)

	module.exports = React.createClass({

	    displayName: 'LoadMask',

	    getDefaultProps: function(){

	        return {
	            visible: false,
	            visibleDisplayValue: 'block',
	            defaultStyle: {
	                background: 'rgba(128, 128, 128, 0.5)',
	                position: 'absolute',
	                width   : '100%',
	                height  : '100%',
	                display : 'none',
	                top: 0,
	                left: 0
	            }
	        }
	    },

	    render: function(){
	        var props = assign({}, this.props)

	        props.style = this.prepareStyle(props)

	        props.className = props.className || ''
	        props.className += ' loadmask'

	        return React.createElement("div", React.__spread({},  props), 
	            React.createElement(Loader, {size: props.size})
	        )
	    },

	    prepareStyle: function(props){

	        var style = assign({}, props.defaultStyle, props.style)

	        style.display = props.visible?
	                        props.visibleDisplayValue:
	                        'none'

	        return style
	    }
	})

/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var React  = __webpack_require__(6)
	var assign = __webpack_require__(7)

	module.exports = React.createClass({

	    displayName: 'Loader',

	    getDefaultProps: function(){
	        return {
	            defaultStyle: {
	                margin: 'auto',
	                position: 'absolute',
	                top: 0,
	                left: 0,
	                bottom: 0,
	                right: 0,
	            },
	            defaultClassName: 'loader',
	            size: 40,
	        }
	    },

	    render: function() {
	        var props = assign({}, this.props)

	        this.prepareStyle(props)

	        props.className = props.className || ''
	        props.className += ' ' + props.defaultClassName

	        return React.DOM.div(props,
	            React.createElement("div", {className: "loadbar loadbar-1"}),
	            React.createElement("div", {className: "loadbar loadbar-2"}),
	            React.createElement("div", {className: "loadbar loadbar-3"}),
	            React.createElement("div", {className: "loadbar loadbar-4"}),
	            React.createElement("div", {className: "loadbar loadbar-5"}),
	            React.createElement("div", {className: "loadbar loadbar-6"}),
	            React.createElement("div", {className: "loadbar loadbar-7"}),
	            React.createElement("div", {className: "loadbar loadbar-8"}),
	            React.createElement("div", {className: "loadbar loadbar-9"}),
	            React.createElement("div", {className: "loadbar loadbar-10"}),
	            React.createElement("div", {className: "loadbar loadbar-11"}),
	            React.createElement("div", {className: "loadbar loadbar-12"})
	        )
	    },

	    prepareStyle: function(props){

	        var style = {}

	        assign(style, props.defaultStyle)
	        assign(style, props.style)

	        style.width = props.size
	        style.height = props.size

	        props.style = style
	    }
	})

/***/ },
/* 10 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(11)

/***/ },
/* 11 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var hasOwn    = __webpack_require__(12)
	var newify    = __webpack_require__(13)

	var assign      = __webpack_require__(7);
	var EventEmitter = __webpack_require__(15).EventEmitter

	var inherits = __webpack_require__(16)
	var VALIDATE = __webpack_require__(17)

	var objectToString = Object.prototype.toString

	var isObject = function(value){
	    return objectToString.apply(value) === '[object Object]'
	}

	function copyList(source, target, list){
	    if (source){
	        list.forEach(function(key){
	            if (hasOwn(source, key)){
	                target[key] = source[key]
	            }
	        })
	    }

	    return target
	}

	/**
	 * @class Region
	 *
	 * The Region is an abstraction that allows the developer to refer to rectangles on the screen,
	 * and move them around, make diffs and unions, detect intersections, compute areas, etc.
	 *
	 * ## Creating a region
	 *      var region = require('region')({
	 *          top  : 10,
	 *          left : 10,
	 *          bottom: 100,
	 *          right : 100
	 *      })
	 *      //this region is a square, 90x90, starting from (10,10) to (100,100)
	 *
	 *      var second = require('region')({ top: 10, left: 100, right: 200, bottom: 60})
	 *      var union  = region.getUnion(second)
	 *
	 *      //the "union" region is a union between "region" and "second"
	 */

	var POINT_POSITIONS = {
	        cy: 'YCenter',
	        cx: 'XCenter',
	        t : 'Top',
	        tc: 'TopCenter',
	        tl: 'TopLeft',
	        tr: 'TopRight',
	        b : 'Bottom',
	        bc: 'BottomCenter',
	        bl: 'BottomLeft',
	        br: 'BottomRight',
	        l : 'Left',
	        lc: 'LeftCenter',
	        r : 'Right',
	        rc: 'RightCenter',
	        c : 'Center'
	    }

	/**
	 * @constructor
	 *
	 * Construct a new Region.
	 *
	 * Example:
	 *
	 *      var r = new Region({ top: 10, left: 20, bottom: 100, right: 200 })
	 *
	 *      //or, the same, but with numbers (can be used with new or without)
	 *
	 *      r = Region(10, 200, 100, 20)
	 *
	 *      //or, with width and height
	 *
	 *      r = Region({ top: 10, left: 20, width: 180, height: 90})
	 *
	 * @param {Number|Object} top The top pixel position, or an object with top, left, bottom, right properties. If an object is passed,
	 * instead of having bottom and right, it can have width and height.
	 *
	 * @param {Number} right The right pixel position
	 * @param {Number} bottom The bottom pixel position
	 * @param {Number} left The left pixel position
	 *
	 * @return {Region} this
	 */
	var REGION = function(top, right, bottom, left){

	    if (!(this instanceof REGION)){
	        return newify(REGION, arguments)
	    }

	    EventEmitter.call(this)

	    if (isObject(top)){
	        copyList(top, this, ['top','right','bottom','left'])

	        if (top.bottom == null && top.height != null){
	            this.bottom = this.top + top.height
	        }
	        if (top.right == null && top.width != null){
	            this.right = this.left + top.width
	        }

	        if (top.emitChangeEvents){
	            this.emitChangeEvents = top.emitChangeEvents
	        }
	    } else {
	        this.top    = top
	        this.right  = right
	        this.bottom = bottom
	        this.left   = left
	    }

	    this[0] = this.left
	    this[1] = this.top

	    VALIDATE(this)
	}

	inherits(REGION, EventEmitter)

	assign(REGION.prototype, {

	    /**
	     * @cfg {Boolean} emitChangeEvents If this is set to true, the region
	     * will emit 'changesize' and 'changeposition' whenever the size or the position changs
	     */
	    emitChangeEvents: false,

	    /**
	     * Returns this region, or a clone of this region
	     * @param  {Boolean} [clone] If true, this method will return a clone of this region
	     * @return {Region}       This region, or a clone of this
	     */
	    getRegion: function(clone){
	        return clone?
	                    this.clone():
	                    this
	    },

	    /**
	     * Sets the properties of this region to those of the given region
	     * @param {Region/Object} reg The region or object to use for setting properties of this region
	     * @return {Region} this
	     */
	    setRegion: function(reg){

	        if (reg instanceof REGION){
	            this.set(reg.get())
	        } else {
	            this.set(reg)
	        }

	        return this
	    },

	    /**
	     * Returns true if this region is valid, false otherwise
	     *
	     * @param  {Region} region The region to check
	     * @return {Boolean}        True, if the region is valid, false otherwise.
	     * A region is valid if
	     *  * left <= right  &&
	     *  * top  <= bottom
	     */
	    validate: function(){
	        return REGION.validate(this)
	    },

	    _before: function(){
	        if (this.emitChangeEvents){
	            return copyList(this, {}, ['left','top','bottom','right'])
	        }
	    },

	    _after: function(before){
	        if (this.emitChangeEvents){

	            if(this.top != before.top || this.left != before.left) {
	                this.emitPositionChange()
	            }

	            if(this.right != before.right || this.bottom != before.bottom) {
	                this.emitSizeChange()
	            }
	        }
	    },

	    notifyPositionChange: function(){
	        this.emit('changeposition', this)
	    },

	    emitPositionChange: function(){
	        this.notifyPositionChange()
	    },

	    notifySizeChange: function(){
	        this.emit('changesize', this)
	    },

	    emitSizeChange: function(){
	        this.notifySizeChange()
	    },

	    /**
	     * Add the given amounts to each specified side. Example
	     *
	     *      region.add({
	     *          top: 50,    //add 50 px to the top side
	     *          bottom: -100    //substract 100 px from the bottom side
	     *      })
	     *
	     * @param {Object} directions
	     * @param {Number} [directions.top]
	     * @param {Number} [directions.left]
	     * @param {Number} [directions.bottom]
	     * @param {Number} [directions.right]
	     *
	     * @return {Region} this
	     */
	    add: function(directions){

	        var before = this._before()
	        var direction

	        for (direction in directions) if ( hasOwn(directions, direction) ) {
	            this[direction] += directions[direction]
	        }

	        this[0] = this.left
	        this[1] = this.top

	        this._after(before)

	        return this
	    },

	    /**
	     * The same as {@link #add}, but substracts the given values
	     * @param {Object} directions
	     * @param {Number} [directions.top]
	     * @param {Number} [directions.left]
	     * @param {Number} [directions.bottom]
	     * @param {Number} [directions.right]
	     *
	     * @return {Region} this
	     */
	    substract: function(directions){

	        var before = this._before()
	        var direction

	        for (direction in directions) if (hasOwn(directions, direction) ) {
	            this[direction] -= directions[direction]
	        }

	        this[0] = this.left
	        this[1] = this.top

	        this._after(before)

	        return this
	    },

	    /**
	     * Retrieves the size of the region.
	     * @return {Object} An object with {width, height}, corresponding to the width and height of the region
	     */
	    getSize: function(){
	        return {
	            width  : this.width,
	            height : this.height
	        }
	    },

	    /**
	     * Move the region to the given position and keeps the region width and height.
	     *
	     * @param {Object} position An object with {top, left} properties. The values in {top,left} are used to move the region by the given amounts.
	     * @param {Number} [position.left]
	     * @param {Number} [position.top]
	     *
	     * @return {Region} this
	     */
	    setPosition: function(position){
	        var width  = this.width
	        var height = this.height

	        if (position.left != undefined){
	            position.right  = position.left + width
	        }

	        if (position.top != undefined){
	            position.bottom = position.top  + height
	        }

	        return this.set(position)
	    },

	    /**
	     * Sets both the height and the width of this region to the given size.
	     *
	     * @param {Number} size The new size for the region
	     * @return {Region} this
	     */
	    setSize: function(size){
	        if (size.height != undefined && size.width != undefined){
	            return this.set({
	                right  : this.left + size.width,
	                bottom : this.top  + size.height
	            })
	        }

	        if (size.width != undefined){
	            this.setWidth(size.width)
	        }

	        if (size.height != undefined){
	            this.setHeight(size.height)
	        }

	        return this
	    },



	    /**
	     * @chainable
	     *
	     * Sets the width of this region
	     * @param {Number} width The new width for this region
	     * @return {Region} this
	     */
	    setWidth: function(width){
	        return this.set({
	            right: this.left + width
	        })
	    },

	    /**
	     * @chainable
	     *
	     * Sets the height of this region
	     * @param {Number} height The new height for this region
	     * @return {Region} this
	     */
	    setHeight: function(height){
	        return this.set({
	            bottom: this.top + height
	        })
	    },

	    /**
	     * Sets the given properties on this region
	     *
	     * @param {Object} directions an object containing top, left, and EITHER bottom, right OR width, height
	     * @param {Number} [directions.top]
	     * @param {Number} [directions.left]
	     *
	     * @param {Number} [directions.bottom]
	     * @param {Number} [directions.right]
	     *
	     * @param {Number} [directions.width]
	     * @param {Number} [directions.height]
	     *
	     *
	     * @return {Region} this
	     */
	    set: function(directions){
	        var before = this._before()

	        copyList(directions, this, ['left','top','bottom','right'])

	        if (directions.bottom == null && directions.height != null){
	            this.bottom = this.top + directions.height
	        }
	        if (directions.right == null && directions.width != null){
	            this.right = this.left + directions.width
	        }

	        this[0] = this.left
	        this[1] = this.top

	        this._after(before)

	        return this
	    },

	    /**
	     * Retrieves the given property from this region. If no property is given, return an object
	     * with {left, top, right, bottom}
	     *
	     * @param {String} [dir] the property to retrieve from this region
	     * @return {Number/Object}
	     */
	    get: function(dir){
	        return dir? this[dir]:
	                    copyList(this, {}, ['left','right','top','bottom'])
	    },

	    /**
	     * Shifts this region to either top, or left or both.
	     * Shift is similar to {@link #add} by the fact that it adds the given dimensions to top/left sides, but also adds the given dimensions
	     * to bottom and right
	     *
	     * @param {Object} directions
	     * @param {Number} [directions.top]
	     * @param {Number} [directions.left]
	     *
	     * @return {Region} this
	     */
	    shift: function(directions){

	        var before = this._before()

	        if (directions.top){
	            this.top    += directions.top
	            this.bottom += directions.top
	        }

	        if (directions.left){
	            this.left  += directions.left
	            this.right += directions.left
	        }

	        this[0] = this.left
	        this[1] = this.top

	        this._after(before)

	        return this
	    },

	    /**
	     * Same as {@link #shift}, but substracts the given values
	     * @chainable
	     *
	     * @param {Object} directions
	     * @param {Number} [directions.top]
	     * @param {Number} [directions.left]
	     *
	     * @return {Region} this
	     */
	    unshift: function(directions){

	        if (directions.top){
	            directions.top *= -1
	        }

	        if (directions.left){
	            directions.left *= -1
	        }

	        return this.shift(directions)
	    },

	    /**
	     * Compare this region and the given region. Return true if they have all the same size and position
	     * @param  {Region} region The region to compare with
	     * @return {Boolean}       True if this and region have same size and position
	     */
	    equals: function(region){
	        return this.equalsPosition(region) && this.equalsSize(region)
	    },

	    /**
	     * Returns true if this region has the same bottom,right properties as the given region
	     * @param  {Region/Object} size The region to compare against
	     * @return {Boolean}       true if this region is the same size as the given size
	     */
	    equalsSize: function(size){
	        var isInstance = size instanceof REGION

	        var s = {
	            width: size.width == null && isInstance?
	                    size.getWidth():
	                    size.width,

	            height: size.height == null && isInstance?
	                    size.getHeight():
	                    size.height
	        }
	        return this.getWidth() == s.width && this.getHeight() == s.height
	    },

	    /**
	     * Returns true if this region has the same top,left properties as the given region
	     * @param  {Region} region The region to compare against
	     * @return {Boolean}       true if this.top == region.top and this.left == region.left
	     */
	    equalsPosition: function(region){
	        return this.top == region.top && this.left == region.left
	    },

	    /**
	     * Adds the given ammount to the left side of this region
	     * @param {Number} left The ammount to add
	     * @return {Region} this
	     */
	    addLeft: function(left){
	        var before = this._before()

	        this.left = this[0] = this.left + left

	        this._after(before)

	        return this
	    },

	    /**
	     * Adds the given ammount to the top side of this region
	     * @param {Number} top The ammount to add
	     * @return {Region} this
	     */
	    addTop: function(top){
	        var before = this._before()

	        this.top = this[1] = this.top + top

	        this._after(before)

	        return this
	    },

	    /**
	     * Adds the given ammount to the bottom side of this region
	     * @param {Number} bottom The ammount to add
	     * @return {Region} this
	     */
	    addBottom: function(bottom){
	        var before = this._before()

	        this.bottom += bottom

	        this._after(before)

	        return this
	    },

	    /**
	     * Adds the given ammount to the right side of this region
	     * @param {Number} right The ammount to add
	     * @return {Region} this
	     */
	    addRight: function(right){
	        var before = this._before()

	        this.right += right

	        this._after(before)

	        return this
	    },

	    /**
	     * Minimize the top side.
	     * @return {Region} this
	     */
	    minTop: function(){
	        return this.expand({top: 1})
	    },
	    /**
	     * Minimize the bottom side.
	     * @return {Region} this
	     */
	    maxBottom: function(){
	        return this.expand({bottom: 1})
	    },
	    /**
	     * Minimize the left side.
	     * @return {Region} this
	     */
	    minLeft: function(){
	        return this.expand({left: 1})
	    },
	    /**
	     * Maximize the right side.
	     * @return {Region} this
	     */
	    maxRight: function(){
	        return this.expand({right: 1})
	    },

	    /**
	     * Expands this region to the dimensions of the given region, or the document region, if no region is expanded.
	     * But only expand the given sides (any of the four can be expanded).
	     *
	     * @param {Object} directions
	     * @param {Boolean} [directions.top]
	     * @param {Boolean} [directions.bottom]
	     * @param {Boolean} [directions.left]
	     * @param {Boolean} [directions.right]
	     *
	     * @param {Region} [region] the region to expand to, defaults to the document region
	     * @return {Region} this region
	     */
	    expand: function(directions, region){
	        var docRegion = region || REGION.getDocRegion()
	        var list      = []
	        var direction
	        var before = this._before()

	        for (direction in directions) if ( hasOwn(directions, direction) ) {
	            list.push(direction)
	        }

	        copyList(docRegion, this, list)

	        this[0] = this.left
	        this[1] = this.top

	        this._after(before)

	        return this
	    },

	    /**
	     * Returns a clone of this region
	     * @return {Region} A new region, with the same position and dimension as this region
	     */
	    clone: function(){
	        return new REGION({
	                    top    : this.top,
	                    left   : this.left,
	                    right  : this.right,
	                    bottom : this.bottom
	                })
	    },

	    /**
	     * Returns true if this region contains the given point
	     * @param {Number/Object} x the x coordinate of the point
	     * @param {Number} [y] the y coordinate of the point
	     *
	     * @return {Boolean} true if this region constains the given point, false otherwise
	     */
	    containsPoint: function(x, y){
	        if (arguments.length == 1){
	            y = x.y
	            x = x.x
	        }

	        return this.left <= x  &&
	               x <= this.right &&
	               this.top <= y   &&
	               y <= this.bottom
	    },

	    /**
	     *
	     * @param region
	     *
	     * @return {Boolean} true if this region contains the given region, false otherwise
	     */
	    containsRegion: function(region){
	        return this.containsPoint(region.left, region.top)    &&
	               this.containsPoint(region.right, region.bottom)
	    },

	    /**
	     * Returns an object with the difference for {top, bottom} positions betwen this and the given region,
	     *
	     * See {@link #diff}
	     * @param  {Region} region The region to use for diff
	     * @return {Object}        {top,bottom}
	     */
	    diffHeight: function(region){
	        return this.diff(region, {top: true, bottom: true})
	    },

	    /**
	     * Returns an object with the difference for {left, right} positions betwen this and the given region,
	     *
	     * See {@link #diff}
	     * @param  {Region} region The region to use for diff
	     * @return {Object}        {left,right}
	     */
	    diffWidth: function(region){
	        return this.diff(region, {left: true, right: true})
	    },

	    /**
	     * Returns an object with the difference in sizes for the given directions, between this and region
	     *
	     * @param  {Region} region     The region to use for diff
	     * @param  {Object} directions An object with the directions to diff. Can have any of the following keys:
	     *  * left
	     *  * right
	     *  * top
	     *  * bottom
	     *
	     * @return {Object} and object with the same keys as the directions object, but the values being the
	     * differences between this region and the given region
	     */
	    diff: function(region, directions){
	        var result = {}
	        var dirName

	        for (dirName in directions) if ( hasOwn(directions, dirName) ) {
	            result[dirName] = this[dirName] - region[dirName]
	        }

	        return result
	    },

	    /**
	     * Returns the position, in {left,top} properties, of this region
	     *
	     * @return {Object} {left,top}
	     */
	    getPosition: function(){
	        return {
	            left: this.left,
	            top : this.top
	        }
	    },

	    /**
	     * Returns the point at the given position from this region.
	     *
	     * @param {String} position Any of:
	     *
	     *  * 'cx' - See {@link #getPointXCenter}
	     *  * 'cy' - See {@link #getPointYCenter}
	     *  * 'b'  - See {@link #getPointBottom}
	     *  * 'bc' - See {@link #getPointBottomCenter}
	     *  * 'l'  - See {@link #getPointLeft}F
	     *  * 'lc' - See {@link #getPointLeftCenter}
	     *  * 't'  - See {@link #getPointTop}
	     *  * 'tc' - See {@link #getPointTopCenter}
	     *  * 'r'  - See {@link #getPointRight}
	     *  * 'rc' - See {@link #getPointRightCenter}
	     *  * 'c'  - See {@link #getPointCenter}
	     *  * 'tl' - See {@link #getPointTopLeft}
	     *  * 'bl' - See {@link #getPointBottomLeft}
	     *  * 'br' - See {@link #getPointBottomRight}
	     *  * 'tr' - See {@link #getPointTopRight}
	     *
	     * @param {Boolean} asLeftTop
	     *
	     * @return {Object} either an object with {x,y} or {left,top} if asLeftTop is true
	     */
	    getPoint: function(position, asLeftTop){

	        //<debug>
	        if (!POINT_POSITIONS[position]) {
	            console.warn('The position ', position, ' could not be found! Available options are tl, bl, tr, br, l, r, t, b.');
	        }
	        //</debug>

	        var method = 'getPoint' + POINT_POSITIONS[position],
	            result = this[method]()

	        if (asLeftTop){
	            return {
	                left : result.x,
	                top  : result.y
	            }
	        }

	        return result
	    },

	    /**
	     * Returns a point with x = null and y being the middle of the left region segment
	     * @return {Object} {x,y}
	     */
	    getPointYCenter: function(){
	        return { x: null, y: this.top + this.getHeight() / 2 }
	    },

	    /**
	     * Returns a point with y = null and x being the middle of the top region segment
	     * @return {Object} {x,y}
	     */
	    getPointXCenter: function(){
	        return { x: this.left + this.getWidth() / 2, y: null }
	    },

	    /**
	     * Returns a point with x = null and y the region top position on the y axis
	     * @return {Object} {x,y}
	     */
	    getPointTop: function(){
	        return { x: null, y: this.top }
	    },

	    /**
	     * Returns a point that is the middle point of the region top segment
	     * @return {Object} {x,y}
	     */
	    getPointTopCenter: function(){
	        return { x: this.left + this.getWidth() / 2, y: this.top }
	    },

	    /**
	     * Returns a point that is the top-left point of the region
	     * @return {Object} {x,y}
	     */
	    getPointTopLeft: function(){
	        return { x: this.left, y: this.top}
	    },

	    /**
	     * Returns a point that is the top-right point of the region
	     * @return {Object} {x,y}
	     */
	    getPointTopRight: function(){
	        return { x: this.right, y: this.top}
	    },

	    /**
	     * Returns a point with x = null and y the region bottom position on the y axis
	     * @return {Object} {x,y}
	     */
	    getPointBottom: function(){
	        return { x: null, y: this.bottom }
	    },

	    /**
	     * Returns a point that is the middle point of the region bottom segment
	     * @return {Object} {x,y}
	     */
	    getPointBottomCenter: function(){
	        return { x: this.left + this.getWidth() / 2, y: this.bottom }
	    },

	    /**
	     * Returns a point that is the bottom-left point of the region
	     * @return {Object} {x,y}
	     */
	    getPointBottomLeft: function(){
	        return { x: this.left, y: this.bottom}
	    },

	    /**
	     * Returns a point that is the bottom-right point of the region
	     * @return {Object} {x,y}
	     */
	    getPointBottomRight: function(){
	        return { x: this.right, y: this.bottom}
	    },

	    /**
	     * Returns a point with y = null and x the region left position on the x axis
	     * @return {Object} {x,y}
	     */
	    getPointLeft: function(){
	        return { x: this.left, y: null }
	    },

	    /**
	     * Returns a point that is the middle point of the region left segment
	     * @return {Object} {x,y}
	     */
	    getPointLeftCenter: function(){
	        return { x: this.left, y: this.top + this.getHeight() / 2 }
	    },

	    /**
	     * Returns a point with y = null and x the region right position on the x axis
	     * @return {Object} {x,y}
	     */
	    getPointRight: function(){
	        return { x: this.right, y: null }
	    },

	    /**
	     * Returns a point that is the middle point of the region right segment
	     * @return {Object} {x,y}
	     */
	    getPointRightCenter: function(){
	        return { x: this.right, y: this.top + this.getHeight() / 2 }
	    },

	    /**
	     * Returns a point that is the center of the region
	     * @return {Object} {x,y}
	     */
	    getPointCenter: function(){
	        return { x: this.left + this.getWidth() / 2, y: this.top + this.getHeight() / 2 }
	    },

	    /**
	     * @return {Number} returns the height of the region
	     */
	    getHeight: function(){
	        return this.bottom - this.top
	    },

	    /**
	     * @return {Number} returns the width of the region
	     */
	    getWidth: function(){
	        return this.right - this.left
	    },

	    /**
	     * @return {Number} returns the top property of the region
	     */
	    getTop: function(){
	        return this.top
	    },

	    /**
	     * @return {Number} returns the left property of the region
	     */
	    getLeft: function(){
	        return this.left
	    },

	    /**
	     * @return {Number} returns the bottom property of the region
	     */
	    getBottom: function(){
	        return this.bottom
	    },

	    /**
	     * @return {Number} returns the right property of the region
	     */
	    getRight: function(){
	        return this.right
	    },

	    /**
	     * Returns the area of the region
	     * @return {Number} the computed area
	     */
	    getArea: function(){
	        return this.getWidth() * this.getHeight()
	    },

	    constrainTo: function(contrain){
	        var intersect = this.getIntersection(contrain)
	        var shift

	        if (!intersect || !intersect.equals(this)){

	            var contrainWidth  = contrain.getWidth(),
	                contrainHeight = contrain.getHeight()

	            if (this.getWidth() > contrainWidth){
	                this.left = contrain.left
	                this.setWidth(contrainWidth)
	            }

	            if (this.getHeight() > contrainHeight){
	                this.top = contrain.top
	                this.setHeight(contrainHeight)
	            }

	            shift = {}

	            if (this.right > contrain.right){
	                shift.left = contrain.right - this.right
	            }

	            if (this.bottom > contrain.bottom){
	                shift.top = contrain.bottom - this.bottom
	            }

	            if (this.left < contrain.left){
	                shift.left = contrain.left - this.left
	            }

	            if (this.top < contrain.top){
	                shift.top = contrain.top - this.top
	            }

	            this.shift(shift)

	            return true
	        }

	        return false
	    },

	    __IS_REGION: true

	    /**
	     * @property {Number} top
	     */

	    /**
	     * @property {Number} right
	     */

	    /**
	     * @property {Number} bottom
	     */

	    /**
	     * @property {Number} left
	     */

	    /**
	     * @property {Number} [0] the top property
	     */

	    /**
	     * @property {Number} [1] the left property
	     */

	    /**
	     * @method getIntersection
	     * Returns a region that is the intersection of this region and the given region
	     * @param  {Region} region The region to intersect with
	     * @return {Region}        The intersection region
	     */

	    /**
	     * @method getUnion
	     * Returns a region that is the union of this region with the given region
	     * @param  {Region} region  The region to make union with
	     * @return {Region}        The union region. The smallest region that contains both this and the given region.
	     */

	})

	Object.defineProperties(REGION.prototype, {
	    width: {
	        get: function(){
	            return this.getWidth()
	        },
	        set: function(width){
	            return this.setWidth(width)
	        }
	    },
	    height: {
	        get: function(){
	            return this.getHeight()
	        },
	        set: function(height){
	            return this.setHeight(height)
	        }
	    }
	})

	__webpack_require__(18)(REGION)

	module.exports = REGION

/***/ },
/* 12 */
/***/ function(module, exports) {

	'use strict'

	var hasOwn = Object.prototype.hasOwnProperty

	function curry(fn, n){

	    if (typeof n !== 'number'){
	        n = fn.length
	    }

	    function getCurryClosure(prevArgs){

	        function curryClosure() {

	            var len  = arguments.length
	            var args = [].concat(prevArgs)

	            if (len){
	                args.push.apply(args, arguments)
	            }

	            if (args.length < n){
	                return getCurryClosure(args)
	            }

	            return fn.apply(this, args)
	        }

	        return curryClosure
	    }

	    return getCurryClosure([])
	}


	module.exports = curry(function(object, property){
	    return hasOwn.call(object, property)
	})

/***/ },
/* 13 */
/***/ function(module, exports, __webpack_require__) {

	var getInstantiatorFunction = __webpack_require__(14)

	module.exports = function(fn, args){
		return getInstantiatorFunction(args.length)(fn, args)
	}

/***/ },
/* 14 */
/***/ function(module, exports) {

	module.exports = function(){

	    'use strict';

	    var fns = {}

	    return function(len){

	        if ( ! fns [len ] ) {

	            var args = []
	            var i    = 0

	            for (; i < len; i++ ) {
	                args.push( 'a[' + i + ']')
	            }

	            fns[len] = new Function(
	                            'c',
	                            'a',
	                            'return new c(' + args.join(',') + ')'
	                        )
	        }

	        return fns[len]
	    }

	}()

/***/ },
/* 15 */
/***/ function(module, exports) {

	// Copyright Joyent, Inc. and other Node contributors.
	//
	// Permission is hereby granted, free of charge, to any person obtaining a
	// copy of this software and associated documentation files (the
	// "Software"), to deal in the Software without restriction, including
	// without limitation the rights to use, copy, modify, merge, publish,
	// distribute, sublicense, and/or sell copies of the Software, and to permit
	// persons to whom the Software is furnished to do so, subject to the
	// following conditions:
	//
	// The above copyright notice and this permission notice shall be included
	// in all copies or substantial portions of the Software.
	//
	// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
	// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
	// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
	// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
	// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
	// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
	// USE OR OTHER DEALINGS IN THE SOFTWARE.

	function EventEmitter() {
	  this._events = this._events || {};
	  this._maxListeners = this._maxListeners || undefined;
	}
	module.exports = EventEmitter;

	// Backwards-compat with node 0.10.x
	EventEmitter.EventEmitter = EventEmitter;

	EventEmitter.prototype._events = undefined;
	EventEmitter.prototype._maxListeners = undefined;

	// By default EventEmitters will print a warning if more than 10 listeners are
	// added to it. This is a useful default which helps finding memory leaks.
	EventEmitter.defaultMaxListeners = 10;

	// Obviously not all Emitters should be limited to 10. This function allows
	// that to be increased. Set to zero for unlimited.
	EventEmitter.prototype.setMaxListeners = function(n) {
	  if (!isNumber(n) || n < 0 || isNaN(n))
	    throw TypeError('n must be a positive number');
	  this._maxListeners = n;
	  return this;
	};

	EventEmitter.prototype.emit = function(type) {
	  var er, handler, len, args, i, listeners;

	  if (!this._events)
	    this._events = {};

	  // If there is no 'error' event listener then throw.
	  if (type === 'error') {
	    if (!this._events.error ||
	        (isObject(this._events.error) && !this._events.error.length)) {
	      er = arguments[1];
	      if (er instanceof Error) {
	        throw er; // Unhandled 'error' event
	      }
	      throw TypeError('Uncaught, unspecified "error" event.');
	    }
	  }

	  handler = this._events[type];

	  if (isUndefined(handler))
	    return false;

	  if (isFunction(handler)) {
	    switch (arguments.length) {
	      // fast cases
	      case 1:
	        handler.call(this);
	        break;
	      case 2:
	        handler.call(this, arguments[1]);
	        break;
	      case 3:
	        handler.call(this, arguments[1], arguments[2]);
	        break;
	      // slower
	      default:
	        args = Array.prototype.slice.call(arguments, 1);
	        handler.apply(this, args);
	    }
	  } else if (isObject(handler)) {
	    args = Array.prototype.slice.call(arguments, 1);
	    listeners = handler.slice();
	    len = listeners.length;
	    for (i = 0; i < len; i++)
	      listeners[i].apply(this, args);
	  }

	  return true;
	};

	EventEmitter.prototype.addListener = function(type, listener) {
	  var m;

	  if (!isFunction(listener))
	    throw TypeError('listener must be a function');

	  if (!this._events)
	    this._events = {};

	  // To avoid recursion in the case that type === "newListener"! Before
	  // adding it to the listeners, first emit "newListener".
	  if (this._events.newListener)
	    this.emit('newListener', type,
	              isFunction(listener.listener) ?
	              listener.listener : listener);

	  if (!this._events[type])
	    // Optimize the case of one listener. Don't need the extra array object.
	    this._events[type] = listener;
	  else if (isObject(this._events[type]))
	    // If we've already got an array, just append.
	    this._events[type].push(listener);
	  else
	    // Adding the second element, need to change to array.
	    this._events[type] = [this._events[type], listener];

	  // Check for listener leak
	  if (isObject(this._events[type]) && !this._events[type].warned) {
	    if (!isUndefined(this._maxListeners)) {
	      m = this._maxListeners;
	    } else {
	      m = EventEmitter.defaultMaxListeners;
	    }

	    if (m && m > 0 && this._events[type].length > m) {
	      this._events[type].warned = true;
	      console.error('(node) warning: possible EventEmitter memory ' +
	                    'leak detected. %d listeners added. ' +
	                    'Use emitter.setMaxListeners() to increase limit.',
	                    this._events[type].length);
	      if (typeof console.trace === 'function') {
	        // not supported in IE 10
	        console.trace();
	      }
	    }
	  }

	  return this;
	};

	EventEmitter.prototype.on = EventEmitter.prototype.addListener;

	EventEmitter.prototype.once = function(type, listener) {
	  if (!isFunction(listener))
	    throw TypeError('listener must be a function');

	  var fired = false;

	  function g() {
	    this.removeListener(type, g);

	    if (!fired) {
	      fired = true;
	      listener.apply(this, arguments);
	    }
	  }

	  g.listener = listener;
	  this.on(type, g);

	  return this;
	};

	// emits a 'removeListener' event iff the listener was removed
	EventEmitter.prototype.removeListener = function(type, listener) {
	  var list, position, length, i;

	  if (!isFunction(listener))
	    throw TypeError('listener must be a function');

	  if (!this._events || !this._events[type])
	    return this;

	  list = this._events[type];
	  length = list.length;
	  position = -1;

	  if (list === listener ||
	      (isFunction(list.listener) && list.listener === listener)) {
	    delete this._events[type];
	    if (this._events.removeListener)
	      this.emit('removeListener', type, listener);

	  } else if (isObject(list)) {
	    for (i = length; i-- > 0;) {
	      if (list[i] === listener ||
	          (list[i].listener && list[i].listener === listener)) {
	        position = i;
	        break;
	      }
	    }

	    if (position < 0)
	      return this;

	    if (list.length === 1) {
	      list.length = 0;
	      delete this._events[type];
	    } else {
	      list.splice(position, 1);
	    }

	    if (this._events.removeListener)
	      this.emit('removeListener', type, listener);
	  }

	  return this;
	};

	EventEmitter.prototype.removeAllListeners = function(type) {
	  var key, listeners;

	  if (!this._events)
	    return this;

	  // not listening for removeListener, no need to emit
	  if (!this._events.removeListener) {
	    if (arguments.length === 0)
	      this._events = {};
	    else if (this._events[type])
	      delete this._events[type];
	    return this;
	  }

	  // emit removeListener for all listeners on all events
	  if (arguments.length === 0) {
	    for (key in this._events) {
	      if (key === 'removeListener') continue;
	      this.removeAllListeners(key);
	    }
	    this.removeAllListeners('removeListener');
	    this._events = {};
	    return this;
	  }

	  listeners = this._events[type];

	  if (isFunction(listeners)) {
	    this.removeListener(type, listeners);
	  } else if (listeners) {
	    // LIFO order
	    while (listeners.length)
	      this.removeListener(type, listeners[listeners.length - 1]);
	  }
	  delete this._events[type];

	  return this;
	};

	EventEmitter.prototype.listeners = function(type) {
	  var ret;
	  if (!this._events || !this._events[type])
	    ret = [];
	  else if (isFunction(this._events[type]))
	    ret = [this._events[type]];
	  else
	    ret = this._events[type].slice();
	  return ret;
	};

	EventEmitter.prototype.listenerCount = function(type) {
	  if (this._events) {
	    var evlistener = this._events[type];

	    if (isFunction(evlistener))
	      return 1;
	    else if (evlistener)
	      return evlistener.length;
	  }
	  return 0;
	};

	EventEmitter.listenerCount = function(emitter, type) {
	  return emitter.listenerCount(type);
	};

	function isFunction(arg) {
	  return typeof arg === 'function';
	}

	function isNumber(arg) {
	  return typeof arg === 'number';
	}

	function isObject(arg) {
	  return typeof arg === 'object' && arg !== null;
	}

	function isUndefined(arg) {
	  return arg === void 0;
	}


/***/ },
/* 16 */
/***/ function(module, exports) {

	'use strict';

	module.exports = function(ctor, superCtor) {
	    ctor.super_ = superCtor
	    ctor.prototype = Object.create(superCtor.prototype, {
	        constructor: {
	            value       : ctor,
	            enumerable  : false,
	            writable    : true,
	            configurable: true
	        }
	    })
	}

/***/ },
/* 17 */
/***/ function(module, exports) {

	'use strict';

	/**
	 * @static
	 * Returns true if the given region is valid, false otherwise.
	 * @param  {Region} region The region to check
	 * @return {Boolean}        True, if the region is valid, false otherwise.
	 * A region is valid if
	 *  * left <= right  &&
	 *  * top  <= bottom
	 */
	module.exports = function validate(region){

	    var isValid = true

	    if (region.right < region.left){
	        isValid = false
	        region.right = region.left
	    }

	    if (region.bottom < region.top){
	        isValid = false
	        region.bottom = region.top
	    }

	    return isValid
	}

/***/ },
/* 18 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var hasOwn   = __webpack_require__(12)
	var VALIDATE = __webpack_require__(17)

	module.exports = function(REGION){

	    var MAX = Math.max
	    var MIN = Math.min

	    var statics = {
	        init: function(){
	            var exportAsNonStatic = {
	                getIntersection      : true,
	                getIntersectionArea  : true,
	                getIntersectionHeight: true,
	                getIntersectionWidth : true,
	                getUnion             : true
	            }
	            var thisProto = REGION.prototype
	            var newName

	            var exportHasOwn = hasOwn(exportAsNonStatic)
	            var methodName

	            for (methodName in exportAsNonStatic) if (exportHasOwn(methodName)) {
	                newName = exportAsNonStatic[methodName]
	                if (typeof newName != 'string'){
	                    newName = methodName
	                }

	                ;(function(proto, methodName, protoMethodName){

	                    proto[methodName] = function(region){
	                        //<debug>
	                        if (!REGION[protoMethodName]){
	                            console.warn('cannot find method ', protoMethodName,' on ', REGION)
	                        }
	                        //</debug>
	                        return REGION[protoMethodName](this, region)
	                    }

	                })(thisProto, newName, methodName);
	            }
	        },

	        validate: VALIDATE,

	        /**
	         * Returns the region corresponding to the documentElement
	         * @return {Region} The region corresponding to the documentElement. This region is the maximum region visible on the screen.
	         */
	        getDocRegion: function(){
	            return REGION.fromDOM(document.documentElement)
	        },

	        from: function(reg){
	            if (reg.__IS_REGION){
	                return reg
	            }

	            if (typeof document != 'undefined'){
	                if (typeof HTMLElement != 'undefined' && reg instanceof HTMLElement){
	                    return REGION.fromDOM(reg)
	                }

	                if (reg.type && typeof reg.pageX !== 'undefined' && typeof reg.pageY !== 'undefined'){
	                    return REGION.fromEvent(reg)
	                }
	            }

	            return REGION(reg)
	        },

	        fromEvent: function(event){
	            return REGION.fromPoint({
	                x: event.pageX,
	                y: event.pageY
	            })
	        },

	        fromDOM: function(dom){
	            var rect = dom.getBoundingClientRect()
	            // var docElem = document.documentElement
	            // var win     = window

	            // var top  = rect.top + win.pageYOffset - docElem.clientTop
	            // var left = rect.left + win.pageXOffset - docElem.clientLeft

	            return new REGION({
	                top   : rect.top,
	                left  : rect.left,
	                bottom: rect.bottom,
	                right : rect.right
	            })
	        },

	        /**
	         * @static
	         * Returns a region that is the intersection of the given two regions
	         * @param  {Region} first  The first region
	         * @param  {Region} second The second region
	         * @return {Region/Boolean}        The intersection region or false if no intersection found
	         */
	        getIntersection: function(first, second){

	            var area = this.getIntersectionArea(first, second)

	            if (area){
	                return new REGION(area)
	            }

	            return false
	        },

	        getIntersectionWidth: function(first, second){
	            var minRight  = MIN(first.right, second.right)
	            var maxLeft   = MAX(first.left,  second.left)

	            if (maxLeft < minRight){
	                return minRight  - maxLeft
	            }

	            return 0
	        },

	        getIntersectionHeight: function(first, second){
	            var maxTop    = MAX(first.top,   second.top)
	            var minBottom = MIN(first.bottom,second.bottom)

	            if (maxTop  < minBottom){
	                return minBottom - maxTop
	            }

	            return 0
	        },

	        getIntersectionArea: function(first, second){
	            var maxTop    = MAX(first.top,   second.top)
	            var minRight  = MIN(first.right, second.right)
	            var minBottom = MIN(first.bottom,second.bottom)
	            var maxLeft   = MAX(first.left,  second.left)

	            if (
	                    maxTop  < minBottom &&
	                    maxLeft < minRight
	                ){
	                return {
	                    top    : maxTop,
	                    right  : minRight,
	                    bottom : minBottom,
	                    left   : maxLeft,

	                    width  : minRight  - maxLeft,
	                    height : minBottom - maxTop
	                }
	            }

	            return false
	        },

	        /**
	         * @static
	         * Returns a region that is the union of the given two regions
	         * @param  {Region} first  The first region
	         * @param  {Region} second The second region
	         * @return {Region}        The union region. The smallest region that contains both given regions.
	         */
	        getUnion: function(first, second){
	            var top    = MIN(first.top,   second.top)
	            var right  = MAX(first.right, second.right)
	            var bottom = MAX(first.bottom,second.bottom)
	            var left   = MIN(first.left,  second.left)

	            return new REGION(top, right, bottom, left)
	        },

	        /**
	         * @static
	         * Returns a region. If the reg argument is a region, returns it, otherwise return a new region built from the reg object.
	         *
	         * @param  {Region} reg A region or an object with either top, left, bottom, right or
	         * with top, left, width, height
	         * @return {Region} A region
	         */
	        getRegion: function(reg){
	            return REGION.from(reg)
	        },

	        /**
	         * Creates a region that corresponds to a point.
	         *
	         * @param  {Object} xy The point
	         * @param  {Number} xy.x
	         * @param  {Number} xy.y
	         *
	         * @return {Region}    The new region, with top==xy.y, bottom = xy.y and left==xy.x, right==xy.x
	         */
	        fromPoint: function(xy){
	            return new REGION({
	                        top    : xy.y,
	                        bottom : xy.y,
	                        left   : xy.x,
	                        right  : xy.x
	                    })
	        }
	    }

	    Object.keys(statics).forEach(function(key){
	        REGION[key] = statics[key]
	    })

	    REGION.init()
	}

/***/ },
/* 19 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

	var React = __webpack_require__(6);
	var assign = __webpack_require__(7);
	var Toolbar = __webpack_require__(20);
	var Region = Toolbar.Region;
	var normalize = __webpack_require__(21);

	var WHITESPACE = ' ';
	function sortAsc(a, b) {
		return a - b;
	}

	function emptyFn() {}

	function gotoPrev(props) {
		return React.createElement(
			'svg',
			_extends({ version: '1.1', viewBox: '0 0 2 3' }, props),
			React.createElement('polygon', { points: '2,0 2,3 0,1.5 ' })
		);
	}

	function gotoNext(props) {
		return React.createElement(
			'svg',
			_extends({ version: '1.1', viewBox: '0 0 2 3' }, props),
			React.createElement('polygon', { points: '0,0 2,1.5 0,3' })
		);
	}

	function gotoFirst(props) {
		return React.createElement(
			'svg',
			_extends({ version: '1.1', viewBox: '0 0 3 3' }, props),
			React.createElement('polygon', { points: '3,0 3,3 1,1.5' }),
			React.createElement('rect', { height: '3', width: '0.95', y: '0', x: '0' })
		);
	}

	function gotoLast(props) {
		return React.createElement(
			'svg',
			_extends({ version: '1.1', viewBox: '0 0 3 3' }, props),
			React.createElement('polygon', { points: '0,0 0,3 2,1.5' }),
			React.createElement('rect', { height: '3', width: '0.95', y: '0', x: '2' })
		);
	}

	function refresh(props) {
		return React.createElement(
			'svg',
			_extends({ version: '1.1', x: '0px', y: '0px', viewBox: '0 0 487.23 487.23' }, props),
			React.createElement(
				'g',
				null,
				React.createElement('path', { d: 'M55.323,203.641c15.664,0,29.813-9.405,35.872-23.854c25.017-59.604,83.842-101.61,152.42-101.61 c37.797,0,72.449,12.955,100.23,34.442l-21.775,3.371c-7.438,1.153-13.224,7.054-14.232,14.512 c-1.01,7.454,3.008,14.686,9.867,17.768l119.746,53.872c5.249,2.357,11.33,1.904,16.168-1.205 c4.83-3.114,7.764-8.458,7.796-14.208l0.621-131.943c0.042-7.506-4.851-14.144-12.024-16.332 c-7.185-2.188-14.947,0.589-19.104,6.837l-16.505,24.805C370.398,26.778,310.1,0,243.615,0C142.806,0,56.133,61.562,19.167,149.06 c-5.134,12.128-3.84,26.015,3.429,36.987C29.865,197.023,42.152,203.641,55.323,203.641z' }),
				React.createElement('path', { d: 'M464.635,301.184c-7.27-10.977-19.558-17.594-32.728-17.594c-15.664,0-29.813,9.405-35.872,23.854 c-25.018,59.604-83.843,101.61-152.42,101.61c-37.798,0-72.45-12.955-100.232-34.442l21.776-3.369 c7.437-1.153,13.223-7.055,14.233-14.514c1.009-7.453-3.008-14.686-9.867-17.768L49.779,285.089 c-5.25-2.356-11.33-1.905-16.169,1.205c-4.829,3.114-7.764,8.458-7.795,14.207l-0.622,131.943 c-0.042,7.506,4.85,14.144,12.024,16.332c7.185,2.188,14.948-0.59,19.104-6.839l16.505-24.805 c44.004,43.32,104.303,70.098,170.788,70.098c100.811,0,187.481-61.561,224.446-149.059 C473.197,326.043,471.903,312.157,464.635,301.184z' })
			)
		);
	}

	function separator(props) {

		if (props.showSeparators === false) {
			return;
		}

		var margin = 5;
		var width = 2;
		var color = props.iconProps.style.fill;

		var result;

		var sepProps = {
			width: 2,
			margin: 5,
			color: color
		};

		if (props.separatorFactory) {
			result = props.separatorFactory(sepProps);
		}

		if (result !== undefined) {
			return result;
		}

		var style = normalize({
			marginLeft: sepProps.margin,
			marginRight: sepProps.margin,
			width: sepProps.width,
			background: sepProps.color,
			display: 'inline-block',
			alignSelf: 'stretch'
		});

		return React.createElement('span', { style: style });
	}

	var ICON_MAP = {
		gotoFirst: gotoFirst,
		gotoLast: gotoLast,
		gotoPrev: gotoPrev,
		gotoNext: gotoNext,
		refresh: refresh
	};

	var defaultStyles = {
		// gotoPrev: { marginRight: 10},
		// gotoNext: { marginLeft: 10}
	};

	module.exports = React.createClass({

		displayName: 'PaginationToolbar',

		getDefaultProps: function getDefaultProps() {
			return {
				iconSize: 20,
				showRefreshIcon: true,
				showPageSize: true,
				defaultStyle: {
					color: 'inherit'
				},

				pageSizes: [10, 20, 50, 100, 200, 500, 1000],

				theme: '',

				defaultIconProps: {
					version: '1.2',
					style: {
						cursor: 'pointer',
						marginLeft: 3,
						marginRight: 3,
						fill: '#8E8E8E',
						verticalAlign: 'middle'
					},
					disabledStyle: {
						cursor: 'auto',
						fill: '#DFDCDC'
					},
					overStyle: {
						fill: 'gray'
					}
				}
			};
		},

		getInitialState: function getInitialState() {
			return {
				mouseOver: {}
			};
		},

		prepareProps: function prepareProps(thisProps) {
			var props = assign({}, thisProps);

			props.className = this.prepareClassName(props);
			props.iconProps = this.prepareIconProps(props);
			props.style = this.prepareStyle(props);
			props.pageSizes = this.preparePageSizes(props);
			delete props.defaultStyle;

			return props;
		},

		prepareClassName: function prepareClassName(props) {
			var className = props.className || '';

			className += ' react-datagrid-pagination-toolbar';

			return className;
		},

		preparePageSizes: function preparePageSizes(props) {
			var sizes = [].concat(props.pageSizes);

			if (sizes.indexOf(props.pageSize) == -1) {
				sizes.push(props.pageSize);
			}

			return sizes.sort(sortAsc);
		},

		prepareIconProps: function prepareIconProps(props) {
			var iconProps = assign({}, props.defaultIconProps);
			var defaultIconStyle = iconProps.style;
			var defaultIconOverStyle = iconProps.overStyle;
			var defaultIconDisabledStyle = iconProps.disabledStyle;

			assign(iconProps, props.iconProps);

			var iconSizeStyle = {};

			if (props.iconSize != null) {
				iconSizeStyle = { width: props.iconSize, height: props.iconSize };
			}

			if (props.iconHeight != null) {
				iconSizeStyle.height = props.iconHeight;
			}
			if (props.iconWidth != null) {
				iconSizeStyle.width = props.iconWidth;
			}

			iconProps.style = assign({}, defaultIconStyle, iconSizeStyle, iconProps.style);
			iconProps.overStyle = assign({}, defaultIconOverStyle, iconProps.overStyle);
			iconProps.disabledStyle = assign({}, defaultIconDisabledStyle, iconProps.disabledStyle);

			return iconProps;
		},

		prepareStyle: function prepareStyle(props) {
			var borderStyle = {};
			var borderName = 'borderTop';

			if (props.position == 'top') {
				borderName = 'borderBottom';
			}

			if (props.border) {
				borderStyle[borderName] = props.border;
			}

			return assign({}, props.defaultStyle, borderStyle, props.style);
		},

		handleInputChange: function handleInputChange(event) {
			var value = event.target.value * 1;

			if (!isNaN(value) && value >= this.props.minPage && value <= this.props.maxPage && value != this.props.page) {
				this.gotoPage(value);
			}
		},

		handleInputBlur: function handleInputBlur() {
			this.setState({
				inputFocused: false
			});
		},

		handleInputFocus: function handleInputFocus() {

			var page = this.props.page;
			this.setState({
				inputFocused: true
			}, (function () {
				var domNode = React.findDOMNode(this.refs.input);
				domNode.value = page;
			}).bind(this));
		},

		onPageSizeChange: function onPageSizeChange(event) {
			this.props.onPageSizeChange(event.target.value * 1);
		},

		renderInput: function renderInput(props) {
			var otherProps = {};

			if (this.state.inputFocused) {
				otherProps.defaultValue = props.page;
			} else {
				otherProps.value = props.page;
			}

			var inputProps = assign({
				ref: 'input',
				onBlur: this.handleInputBlur,
				onFocus: this.handleInputFocus,
				style: normalize({
					marginLeft: 5,
					marginRight: 5,
					padding: 2,
					maxWidth: 60,
					textAlign: 'right',
					flex: 1,
					minWidth: 40
				}),
				page: props.page,
				onChange: this.handleInputChange
			}, otherProps);

			var defaultFactory = React.DOM.input;
			var factory = props.pageInputFactory || defaultFactory;

			var result = factory(inputProps);

			if (result === undefined) {
				result = defaultFactory(inputProps);
			}

			return result;
		},

		renderSelect: function renderSelect(props) {

			var options = props.pageSizes.map(function (value) {
				return React.createElement(
					'option',
					{ value: value },
					value
				);
			});

			var selectProps = {
				onChange: this.onPageSizeChange,
				value: props.pageSize,
				style: { marginLeft: 5, marginRight: 5, padding: 2, textAlign: 'right' },
				children: options
			};

			var defaultFactory = React.DOM.select;
			var factory = props.pageSizeSelectFactory || defaultFactory;

			var result = factory(selectProps);

			if (result === undefined) {
				result = defaultFactory(selectProps);
			}

			return result;
		},

		renderDisplaying: function renderDisplaying(props) {
			var start = (props.pageSize * (props.page - 1) || 0) + 1;
			var end = Math.min(props.pageSize * props.page, props.dataSourceCount) || 1;
			var refreshIcon = props.showRefreshIcon ? this.icon('refresh', props) : null;
			var sep = refreshIcon ? this.separator : null;

			var factory = props.displayingFactory;

			if (factory) {
				return factory({
					start: start,
					end: end,
					dataSourceCount: props.dataSourceCount,
					page: props.page,
					pageSize: props.pageSize,
					minPage: props.minPage,
					maxPage: props.maxPage,
					reload: this.reload,
					gotoPage: this.gotoPage,
					refreshIcon: refreshIcon
				});
			}

			var textStyle = { display: 'inline-block', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' };

			return React.createElement(
				'div',
				{ style: normalize({ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }) },
				React.createElement(
					'span',
					{ style: textStyle },
					'Displaying ',
					start,
					' - ',
					end,
					' of ',
					props.dataSourceCount || 1,
					'.'
				),
				sep,
				refreshIcon
			);
		},

		renderPageSize: function renderPageSize(props) {
			if (props.showPageSize) {
				return React.createElement(
					'div',
					null,
					'Page size ',
					this.renderSelect(props)
				);
			}
		},

		render: function render() {

			var props = this.prepareProps(this.props);

			this.separator = separator(props);

			var showPageSize = props.showPageSize;
			var pageSize = showPageSize ? this.renderPageSize(props) : null;

			var start = props.pageSize * (props.page - 1) + 1;
			var end = Math.min(props.pageSize * props.page, props.dataSourceCount);

			var displaying = this.renderDisplaying(props);
			var minWidth = 430;

			if (!showPageSize) {
				minWidth -= 100;
			}

			var sep = this.separator;

			return React.createElement(
				Toolbar,
				props,
				React.createElement(
					Region,
					{ flex: '1 1 auto', style: normalize({ display: 'flex', alignItems: 'center', minWidth: minWidth }) },
					this.icon('gotoFirst', props),
					this.icon('gotoPrev', props),
					sep,
					'Page ',
					this.renderInput(props),
					' of',
					WHITESPACE,
					props.maxPage,
					'.',
					sep,
					this.icon('gotoNext', props),
					this.icon('gotoLast', props),
					showPageSize ? sep : null,
					pageSize
				),
				React.createElement(
					Region,
					{ flex: '1 1 auto' },
					displaying
				)
			);
		},

		icon: function icon(iconName, props) {
			var icon = props[iconName + 'Icon'];

			if (!icon || typeof icon != 'function') {
				var MAP = {
					refresh: props.page,
					gotoFirst: props.minPage,
					gotoLast: props.maxPage,
					gotoPrev: Math.max(props.page - 1, props.minPage),
					gotoNext: Math.min(props.page + 1, props.maxPage)
				};

				var targetPage = MAP[iconName];
				var disabled = targetPage === props.page && iconName != 'refresh';
				var mouseOver = this.state.mouseOver[iconName];

				var iconProps = assign({
					mouseOver: mouseOver,
					name: iconName,
					disabled: disabled
				}, props.iconProps);

				var iconStyle = iconProps.style = assign({}, iconProps.style, defaultStyles[iconName], props.iconStyle, props[iconName + 'IconStyle']);

				if (mouseOver) {
					iconProps.style = assign({}, iconStyle, iconProps.overStyle, props.overIconStyle);
				}
				if (disabled) {
					iconProps.style = assign({}, iconStyle, iconProps.disabledStyle, props.disabledIconStyle);
				} else {
					iconProps.onClick = iconName == 'refresh' ? this.reload : this.gotoPage.bind(this, targetPage);
				}

				iconProps.onMouseEnter = this.onIconMouseEnter.bind(this, props, iconProps);
				iconProps.onMouseLeave = this.onIconMouseLeave.bind(this, props, iconProps);

				var defaultFactory = ICON_MAP[iconName];
				var factory = props[iconName + 'IconFactory'] || defaultFactory;
				icon = factory(iconProps);

				if (icon === undefined) {
					icon = defaultFactory(iconProps);
				}
			}

			return icon;
		},

		onIconMouseEnter: function onIconMouseEnter(props, iconProps) {
			var mouseOver = this.state.mouseOver;

			mouseOver[iconProps.name] = true;

			this.setState({});
		},

		onIconMouseLeave: function onIconMouseLeave(props, iconProps) {
			var mouseOver = this.state.mouseOver;

			mouseOver[iconProps.name] = false;

			this.setState({});
		},

		reload: function reload() {
			;(this.props.reload || emptyFn)();
		},

		gotoPage: function gotoPage(page) {
			this.props.onPageChange(page);
		}
	});

/***/ },
/* 20 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var React     = __webpack_require__(6)
	var normalize = __webpack_require__(21)
	var assign    = __webpack_require__(7)
	var clone = React.cloneElement || __webpack_require__(33)
	var emptyFn = function(){}

	var DISPLAY_NAME = 'ReactToolbar'

	function isRegion(child){
		return child && child.props && child.props.isToolbarRegion
	}

	function toAlign(index, regions){
		if (index == 0){
			return 'left'
		}

		if (index == regions.length - 1){
			return 'right'
		}

		return 'center'
	}

	var THEMES = {
		default: {
			style: {
				//theme styles
				color  : 'rgb(120, 120, 120)',
				border : '1px solid rgb(218, 218, 218)'
			}
		}
	}

	var Toolbar = React.createClass({

		displayName: DISPLAY_NAME,

		getDefaultProps: function() {
			return {
				'data-display-name': DISPLAY_NAME,
				isReactToolbar: true,

				padding: 2,
				theme: 'default',

				defaultStyle  : {
					display  : 'inline-flex',
					boxSizing: 'border-box',
					overflow: 'hidden',
					whiteSpace: 'nowrap',
					textOverflow: 'ellipsis',

					padding: 2
				},

				defaultHorizontalStyle: {
					width       : '100%',
					flexFlow    : 'row',
					alignItems  : 'center', //so items are centered vertically
					alignContent: 'stretch'
				},

				defaultVerticalStyle: {
					height      : '100%',
					flexFlow    : 'column',
					alignItems  : 'stretch',
					alignContent: 'center'
				}
			}
		},

		getInitialState: function(){
			return {}
		},

		render: function(){

			var state = this.state
			var props = this.prepareProps(this.props, state)

			// this.prepareContent(props)

			return React.createElement("div", React.__spread({},  props))
		},

		prepareContent: function(props){

			// var style = {
			// 	display : 'inline-flex',
			// 	position: 'relative',
			// 	overflow: 'hidden',
			// 	flex    : '1 0 0',
			// 	padding : props.style.padding
			// }

			// props.style.padding = 0
		},

		prepareProps: function(thisProps, state) {
			var props = assign({}, thisProps)

			props.vertical = props.orientation == 'vertical'
			props.style    = this.prepareStyle(props, state)
			props.children = this.prepareChildren(props, state)

			return props
		},

		prepareStyle: function(props, state) {

			var defaultOrientationStyle = props.defaultHorizontalStyle
			var orientationStyle = props.horizontalStyle

			if (props.vertical){
				defaultOrientationStyle = props.defaultVerticalStyle
				orientationStyle = props.verticalStyle
			}

			var themes     = Toolbar.themes || {}
			var theme      = themes[props.theme]
			var themeStyle = theme? theme.style: null

			var style = assign({}, props.defaultStyle, defaultOrientationStyle, themeStyle, props.style, orientationStyle)

			return normalize(style)
		},

		prepareChildren: function(props) {

			var regionCount = 0

			var children = []
			var regions  = []

			React.Children.forEach(props.children, function(child){
				if (isRegion(child)){
					regions.push(child)
					regionCount++
				}
			}, this)


			var regionIndex = -1
			React.Children.forEach(props.children, function(child){
				if (isRegion(child)){
					regionIndex++
					child = this.prepareRegion(child, regionIndex, regions)
				}

				children.push(child)
			}, this)

			if (!regionCount){
				return this.prepareRegion(
					React.createElement(Toolbar.Region, null, 
						children
					)
				)
			}

			return children
		},

		prepareRegion: function(region, index, regions) {
			index   = index   || 0
			regions = regions || []

			var props = this.props
			var regionStyle = assign({}, props.defaultRegionStyle, props.regionStyle)

			if (props.padding){
				regionStyle.padding = props.padding
			}

			var style = assign({}, regionStyle, region.props.style)
			var align = region.props.align || toAlign(index, regions)


			return clone(region, {
				style: style,
				align: align
			})
		}
	})

	Toolbar.Region = __webpack_require__(34)
	Toolbar.themes = THEMES

	module.exports = Toolbar

/***/ },
/* 21 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var hasOwn      = __webpack_require__(22)
	var getPrefixed = __webpack_require__(23)

	var map      = __webpack_require__(29)
	var plugable = __webpack_require__(30)

	function plugins(key, value){

		var result = {
			key  : key,
			value: value
		}

		;(RESULT.plugins || []).forEach(function(fn){

			var tmp = map(function(res){
				return fn(key, value, res)
			}, result)

			if (tmp){
				result = tmp
			}
		})

		return result
	}

	function normalize(key, value){

		var result = plugins(key, value)

		return map(function(result){
			return {
				key  : getPrefixed(result.key, result.value),
				value: result.value
			}
		}, result)

		return result
	}

	var RESULT = function(style){

		var k
		var item
		var result = {}

		for (k in style) if (hasOwn(style, k)){
			item = normalize(k, style[k])

			if (!item){
				continue
			}

			map(function(item){
				result[item.key] = item.value
			}, item)
		}

		return result
	}

	module.exports = plugable(RESULT)

/***/ },
/* 22 */
/***/ function(module, exports) {

	'use strict';

	module.exports = function(obj, prop){
		return Object.prototype.hasOwnProperty.call(obj, prop)
	}


/***/ },
/* 23 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var getStylePrefixed = __webpack_require__(24)
	var properties       = __webpack_require__(28)

	module.exports = function(key, value){

		if (!properties[key]){
			return key
		}

		return getStylePrefixed(key, value)
	}

/***/ },
/* 24 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var toUpperFirst = __webpack_require__(25)
	var getPrefix    = __webpack_require__(26)
	var el           = __webpack_require__(27)

	var MEMORY = {}
	var STYLE
	var ELEMENT

	var PREFIX

	module.exports = function(key, value){

	    ELEMENT = ELEMENT || el()
	    STYLE   = STYLE   || ELEMENT.style

	    var k = key// + ': ' + value

	    if (MEMORY[k]){
	        return MEMORY[k]
	    }

	    var prefix
	    var prefixed

	    if (!(key in STYLE)){//we have to prefix

	        // if (PREFIX){
	        //     prefix = PREFIX
	        // } else {
	            prefix = getPrefix('appearance')

	        //     if (prefix){
	        //         prefix = PREFIX = prefix.toLowerCase()
	        //     }
	        // }

	        if (prefix){
	            prefixed = prefix + toUpperFirst(key)

	            if (prefixed in STYLE){
	                key = prefixed
	            }
	        }
	    }

	    MEMORY[k] = key

	    return key
	}

/***/ },
/* 25 */
/***/ function(module, exports) {

	'use strict';

	module.exports = function(str){
		return str?
				str.charAt(0).toUpperCase() + str.slice(1):
				''
	}

/***/ },
/* 26 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var toUpperFirst = __webpack_require__(25)
	var prefixes     = ["ms", "Moz", "Webkit", "O"]

	var el = __webpack_require__(27)

	var ELEMENT
	var PREFIX

	module.exports = function(key){

		if (PREFIX !== undefined){
			return PREFIX
		}

		ELEMENT = ELEMENT || el()

		var i = 0
		var len = prefixes.length
		var tmp
		var prefix

		for (; i < len; i++){
			prefix = prefixes[i]
			tmp = prefix + toUpperFirst(key)

			if (typeof ELEMENT.style[tmp] != 'undefined'){
				return PREFIX = prefix
			}
		}

		return PREFIX
	}

/***/ },
/* 27 */
/***/ function(module, exports) {

	/* WEBPACK VAR INJECTION */(function(global) {'use strict';

	var el

	module.exports = function(){

		if(!el && !!global.document){
		  	el = global.document.createElement('div')
		}

		if (!el){
			el = {style: {}}
		}

		return el
	}
	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ },
/* 28 */
/***/ function(module, exports) {

	'use strict';

	module.exports = {
	  'alignItems': 1,
	  'justifyContent': 1,
	  'flex': 1,
	  'flexFlow': 1,
	  'flexGrow': 1,
	  'flexShrink': 1,
	  'flexBasis': 1,
	  'flexDirection': 1,
	  'flexWrap': 1,
	  'alignContent': 1,
	  'alignSelf': 1,

	  'userSelect': 1,
	  'transform': 1,
	  'transition': 1,
	  'transformOrigin': 1,
	  'transformStyle': 1,
	  'transitionProperty': 1,
	  'transitionDuration': 1,
	  'transitionTimingFunction': 1,
	  'transitionDelay': 1,
	  'borderImage': 1,
	  'borderImageSlice': 1,
	  'boxShadow': 1,
	  'backgroundClip': 1,
	  'backfaceVisibility': 1,
	  'perspective': 1,
	  'perspectiveOrigin': 1,
	  'animation': 1,
	  'animationDuration': 1,
	  'animationName': 1,
	  'animationDelay': 1,
	  'animationDirection': 1,
	  'animationIterationCount': 1,
	  'animationTimingFunction': 1,
	  'animationPlayState': 1,
	  'animationFillMode': 1,
	  'appearance': 1
	}


/***/ },
/* 29 */
/***/ function(module, exports) {

	'use strict';

	module.exports = function(fn, item){

		if (!item){
			return
		}

		if (Array.isArray(item)){
			return item.map(fn).filter(function(x){
				return !!x
			})
		} else {
			return fn(item)
		}
	}

/***/ },
/* 30 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var getCssPrefixedValue = __webpack_require__(31)

	module.exports = function(target){
		target.plugins = target.plugins || [
			(function(){
				var values = {
					'flex':1,
					'inline-flex':1
				}

				return function(key, value){
					if (key === 'display' && value in values){
						return {
							key  : key,
							value: getCssPrefixedValue(key, value, true)
						}
					}
				}
			})()
		]

		target.plugin = function(fn){
			target.plugins = target.plugins || []

			target.plugins.push(fn)
		}

		return target
	}

/***/ },
/* 31 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var getPrefix     = __webpack_require__(26)
	var forcePrefixed = __webpack_require__(32)
	var el            = __webpack_require__(27)

	var MEMORY = {}
	var STYLE
	var ELEMENT

	module.exports = function(key, value, force){

	    ELEMENT = ELEMENT || el()
	    STYLE   = STYLE   ||  ELEMENT.style

	    var k = key + ': ' + value

	    if (MEMORY[k]){
	        return MEMORY[k]
	    }

	    var prefix
	    var prefixed
	    var prefixedValue

	    if (force || !(key in STYLE)){

	        prefix = getPrefix('appearance')

	        if (prefix){
	            prefixed = forcePrefixed(key, value)

	            prefixedValue = '-' + prefix.toLowerCase() + '-' + value

	            if (prefixed in STYLE){
	                ELEMENT.style[prefixed] = ''
	                ELEMENT.style[prefixed] = prefixedValue

	                if (ELEMENT.style[prefixed] !== ''){
	                    value = prefixedValue
	                }
	            }
	        }
	    }

	    MEMORY[k] = value

	    return value
	}

/***/ },
/* 32 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var toUpperFirst = __webpack_require__(25)
	var getPrefix    = __webpack_require__(26)
	var properties   = __webpack_require__(28)

	/**
	 * Returns the given key prefixed, if the property is found in the prefixProps map.
	 *
	 * Does not test if the property supports the given value unprefixed.
	 * If you need this, use './getPrefixed' instead
	 */
	module.exports = function(key, value){

		if (!properties[key]){
			return key
		}

		var prefix = getPrefix(key)

		return prefix?
					prefix + toUpperFirst(key):
					key
	}

/***/ },
/* 33 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	var React    = __webpack_require__(6)
	  , hasOwn   = Object.prototype.hasOwnProperty
	  , version  = React.version.split('.').map(parseFloat)
	  , RESERVED = {
	      className:  resolve(joinClasses),
	      children:   function(){},
	      key:        function(){},
	      ref:        function(){},
	      style:      resolve(extend)
	    };

	module.exports = function cloneWithProps(child, props) {
	  var newProps = mergeProps(props, child.props);

	  if (!hasOwn.call(newProps, 'children') && hasOwn.call(child.props, 'children'))
	    newProps.children = child.props.children;

	  // < 0.11
	  if (version[0] === 0 && version[1] < 11)
	    return child.constructor.ConvenienceConstructor(newProps);
	  
	  // 0.11
	  if (version[0] === 0 && version[1] === 11)
	    return child.constructor(newProps);

	  // 0.12
	  else if (version[0] === 0 && version[1] === 12){
	    MockLegacyFactory.isReactLegacyFactory = true
	    MockLegacyFactory.type = child.type
	    return React.createElement(MockLegacyFactory, newProps);
	  }

	  // 0.13+
	  return React.createElement(child.type, newProps);

	  function MockLegacyFactory(){}
	}

	function mergeProps(currentProps, childProps) {
	  var newProps = extend(currentProps), key

	  for (key in childProps) {
	    if (hasOwn.call(RESERVED, key) )
	      RESERVED[key](newProps, childProps[key], key)

	    else if ( !hasOwn.call(newProps, key) )
	      newProps[key] = childProps[key];
	  }
	  return newProps
	}

	function resolve(fn){
	  return function(src, value, key){
	    if( !hasOwn.call(src, key)) src[key] = value
	    else src[key] = fn(src[key], value)
	  }
	}

	function joinClasses(a, b){
	  if ( !a ) return b || ''
	  return a + (b ? ' ' + b : '')
	}

	function extend() {
	  var target = {};
	  for (var i = 0; i < arguments.length; i++) 
	    for (var key in arguments[i]) if (hasOwn.call(arguments[i], key)) 
	      target[key] = arguments[i][key]   
	  return target
	}

/***/ },
/* 34 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var React     = __webpack_require__(6)
	var normalize = __webpack_require__(21)
	var assign    = __webpack_require__(7)

	var cloneWithProps = React.cloneElement || __webpack_require__(33)
	var DISPLAY_NAME   = 'ReactToolbarRegion'

	var JUSTIFY_MAP = {
		start: 'flex-start',
		left: 'flex-start',

		end: 'flex-end',
		right: 'flex-end'
	}

	var TEXT_ALIGN = {
		start: 'left',
		left : 'left',

		right: 'right',
		end  :'right'
	}

	module.exports = React.createClass({

		displayName: DISPLAY_NAME,

		getDefaultProps: function(){
			return {
				'data-display-name': DISPLAY_NAME,

				isToolbarRegion: true,

				flex: 1,
				flexShrink: null,
				flexBasis : null,

				defaultStyle: {
					boxSizing   : 'border-box',

					// alignSelf   : 'center',
					alignItems  : 'center',
					flexShrink  : 1,
					flexBasis   : 0,

					position    : 'relative',
					display     : 'inline-block',

					overflow    : 'hidden',
					whiteSpace  : 'nowrap',
					textOverflow: 'ellipsis',
				},

				defaultHorizontalStyle: {
					// display : 'inline-flex',
					flexFlow: 'row'
				},

				defaultVerticalStyle: {
					// display : 'flex',
					flexFlow: 'column'
				}
			}
		},

		render: function(){
			var props = this.prepareProps(this.props)

			return React.createElement("div", React.__spread({},  props))
		},


		prepareProps: function(thisProps) {
			var props = assign({}, thisProps)

			props.vertical = props.orientation == 'vertical'
			props.style    = this.prepareStyle(props)

			return props
		},

		prepareStyle: function(props) {
			var alignStyle = {
				justifyContent: JUSTIFY_MAP[props.align] || 'center',
				textAlign     : TEXT_ALIGN[props.align] || 'center'
			}

			var defaultOrientationStyle = props.defaultHorizontalStyle
			var orientationStyle = props.horizontalStyle

			if (props.vertical){
				defaultOrientationStyle = props.defaultVerticalStyle
				orientationStyle = props.verticalStyle
			}

			var style = assign({},
							props.defaultStyle,
							defaultOrientationStyle,
							props.style,
							orientationStyle,
							alignStyle
						)

			if (props.flex !== false && props.flex != null){
				var flex
				var flexShrink = 0
				var flexBasis  = 0

				if (typeof props.flex == 'number'){
					flex = props.flex + ' ' + (props.flexShrink || style.flexShrink || flexShrink) + ' ' + (props.flexBasis || style.flexBasis || flexBasis)
				} else {
					flex = props.flex
				}

				style.flex = flex
			}

			return normalize(style)
		}
	})

/***/ },
/* 35 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var humanize = __webpack_require__(36).humanize;
	var assign = __webpack_require__(7);

	function getVisibleInfo(col) {
	    var visible = true;
	    var defaultVisible;

	    if (col.hidden != null) {
	        visible = !col.hidden;
	    } else if (col.visible != null) {
	        visible = !!col.visible;
	    } else {
	        //no visible or hidden specified
	        //so we look for defaultVisible/defaultHidden

	        if (col.defaultHidden != null) {
	            defaultVisible = !col.defaultHidden;
	        } else if (col.defaultVisible != null) {
	            defaultVisible = !!col.defaultVisible;
	        }

	        visible = defaultVisible;
	    }

	    return {
	        visible: visible,
	        defaultVisible: defaultVisible
	    };
	}

	var Column = function Column(col, props) {

	    col = assign({}, Column.defaults, col);

	    //title
	    if (!col.title) {
	        col.title = humanize(col.name);
	    }

	    //sortable
	    if (props && !props.sortable) {
	        col.sortable = false;
	    }
	    col.sortable = !!col.sortable;

	    //resizable
	    if (props && props.resizableColumns === false) {
	        col.resizable = false;
	    }
	    col.resizable = !!col.resizable;

	    //filterable
	    if (props && props.filterable === false) {
	        col.filterable = false;
	    }
	    col.filterable = !!col.filterable;

	    var visibleInfo = getVisibleInfo(col);
	    var visible = visibleInfo.visible;

	    if (visibleInfo.defaultVisible != null) {
	        col.defaultHidden = !visibleInfo.defaultVisible;
	        col.defaultVisible = visibleInfo.defaultVisible;
	    }

	    //hidden
	    col.hidden = !visible;
	    //visible
	    col.visible = visible;

	    if (col.width == null && col.defaultWidth) {
	        col.width = col.defaultWidth;
	    }

	    //flexible
	    col.flexible = !col.width;

	    return col;
	};

	Column.displayName = 'Column';

	Column.defaults = {
	    sortable: true,
	    filterable: true,
	    resizable: true,
	    defaultVisible: true,
	    type: 'string'
	};

	module.exports = Column;

/***/ },
/* 36 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = {
	    toLowerFirst     : __webpack_require__(37),
	    toUpperFirst     : __webpack_require__(38),
	    separate         : __webpack_require__(39),
	    stripWhitespace  : __webpack_require__(40),
	    compactWhitespace: __webpack_require__(41),
	    camelize         : __webpack_require__(42),
	    humanize         : __webpack_require__(44),
	    hyphenate        : __webpack_require__(45),
	    endsWith         : __webpack_require__(46),

	    is: __webpack_require__(47)
	}

/***/ },
/* 37 */
/***/ function(module, exports) {

	module.exports = function(str){
	    return str.length?
	            str.charAt(0).toLowerCase() + str.substring(1):
	            str
	}

/***/ },
/* 38 */
/***/ function(module, exports) {

	'use strict'

	module.exports = function(value){
	    return value.length?
	                value.charAt(0).toUpperCase() + value.substring(1):
	                value
	}

/***/ },
/* 39 */
/***/ function(module, exports) {

	'use strict'

	var doubleColonRe      = /::/g
	var upperToLowerRe     = /([A-Z]+)([A-Z][a-z])/g
	var lowerToUpperRe     = /([a-z\d])([A-Z])/g
	var underscoreToDashRe = /_/g

	module.exports = function(name, separator){

	   return name?
	           name.replace(doubleColonRe, '/')
	                .replace(upperToLowerRe, '$1_$2')
	                .replace(lowerToUpperRe, '$1_$2')
	                .replace(underscoreToDashRe, separator || '-')
	            :
	            ''
	}

/***/ },
/* 40 */
/***/ function(module, exports) {

	var RE = /\s/g

	module.exports = function(str){
	    if (!str){
	        return ''
	    }

	    return str.replace(RE, '')
	}

/***/ },
/* 41 */
/***/ function(module, exports) {

	var RE = /\s+/g

	module.exports = function(str){
	    if (!str){
	        return ''
	    }

	    return str.trim().replace(RE, ' ')
	}

/***/ },
/* 42 */
/***/ function(module, exports, __webpack_require__) {

	'use strict'

	var toCamelFn = function(str, letter){
	       return letter ? letter.toUpperCase(): ''
	   }

	var hyphenRe = __webpack_require__(43)

	module.exports = function(str){
	   return str?
	          str.replace(hyphenRe, toCamelFn):
	          ''
	}

/***/ },
/* 43 */
/***/ function(module, exports) {

	module.exports = /[-\s]+(.)?/g

/***/ },
/* 44 */
/***/ function(module, exports, __webpack_require__) {

	'use strict'

	var separate     = __webpack_require__(39)
	var camelize     = __webpack_require__(42)
	var toUpperFirst = __webpack_require__(38)
	var hyphenRe     = __webpack_require__(43)

	function toLowerAndSpace(str, letter){
	    return letter? ' ' + letter.toLowerCase(): ' '
	}

	module.exports = function(name, config){

	    var str = config && config.capitalize?
	                    separate(camelize(name), ' '):
	                    separate(name, ' ').replace(hyphenRe, toLowerAndSpace)

	    return toUpperFirst(str.trim())
	}


/***/ },
/* 45 */
/***/ function(module, exports, __webpack_require__) {

	'use strict'

	var separate = __webpack_require__(39)

	module.exports = function(name){
	   return separate(name).toLowerCase()
	}

/***/ },
/* 46 */
/***/ function(module, exports) {

	'use strict'

	module.exports = function(str, endsWith){

	    str += ''

	    if (!str){
	        return typeof endsWith == 'string'?
	                    !endsWith:
	                    false
	    }

	    endsWith += ''

	    if (str.length < endsWith.length){
	        return false
	    }

	    return str.lastIndexOf(endsWith) == str.length - endsWith.length
	}

/***/ },
/* 47 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = {
	    alphanum: __webpack_require__(48),
	    match   : __webpack_require__(49),
	    guid   : __webpack_require__(65),
	    // email   : require('./email'),
	    numeric   : __webpack_require__(66)
	}

/***/ },
/* 48 */
/***/ function(module, exports, __webpack_require__) {

	'use strict'

	module.exports = __webpack_require__(49)(/^[a-zA-Z0-9]+$/)

/***/ },
/* 49 */
/***/ function(module, exports, __webpack_require__) {

	'use strict'

	var F = __webpack_require__(50)

	module.exports = F.curry(function(re, value){
	    return !!re.test(value)
	})

/***/ },
/* 50 */
/***/ function(module, exports, __webpack_require__) {

	    var setImmediate = function(fn){
	        setTimeout(fn, 0)
	    }
	    var clearImmediate = clearTimeout
	    /**
	     * Utility methods for working with functions.
	     * These methods augment the Function prototype.
	     *
	     * Using {@link #before}
	     *
	     *      function log(m){
	     *          console.log(m)
	     *      }
	     *
	     *      var doLog = function (m){
	     *          console.log('LOG ')
	     *      }.before(log)
	     *
	     *      doLog('test')
	     *      //will log
	     *      //"LOG "
	     *      //and then
	     *      //"test"
	     *
	     *
	     *
	     * Using {@link #bindArgs}:
	     *
	     *      //returns the sum of all arguments
	     *      function add(){
	     *          var sum = 0
	     *          [].from(arguments).forEach(function(n){
	     *              sum += n
	     *          })
	     *
	     *          return sum
	     *      }
	     *
	     *      var add1 = add.bindArgs(1)
	     *
	     *      add1(2, 3) == 6
	     *
	     * Using {@link #lockArgs}:
	     *
	     *      function add(){
	     *          var sum = 0
	     *          [].from(arguments).forEach(function(n){
	     *              sum += n
	     *          })
	     *
	     *          return sum
	     *      }
	     *
	     *      var add1_2   = add.lockArgs(1,2)
	     *      var add1_2_3 = add.lockArgs(1,2,3)
	     *
	     *      add1_2(3,4)  == 3 //args are locked to only be 1 and 2
	     *      add1_2_3(6)  == 6 //args are locked to only be 1, 2 and 3
	     *
	     *
	     *
	     * Using {@link #compose}:
	     *
	     *      function multiply(a,b){
	     *          return a* b
	     *      }
	     *
	     *      var multiply2 = multiply.curry()(2)
	     *
	     *      Function.compose(multiply2( add(5,6) )) == multiply2( add(5,6) )
	     *
	     *
	     * @class Function
	     */

	    var SLICE = Array.prototype.slice

	    var curry = __webpack_require__(51),

	        findFn = function(fn, target, onFound){
	            // if (typeof target.find == 'function'){
	            //     return target.find(fn)
	            // }

	            onFound = typeof onFound == 'function'?
	                        onFound:
	                        function(found, key, target){
	                            return found
	                        }

	            if (Array.isArray(target)){
	                var i   = 0
	                var len = target.length
	                var it

	                for(; i < len; i++){
	                    it = target[i]
	                    if (fn(it, i, target)){
	                        return onFound(it, i, target)
	                    }
	                }

	                return
	            }

	            if (typeof target == 'object'){
	                var keys = Object.keys(target)
	                var i = 0
	                var len = keys.length
	                var k
	                var it

	                for( ; i < len; i++){
	                    k  = keys[i]
	                    it = target[k]

	                    if (fn(it, k, target)){
	                        return onFound(it, k, target)
	                    }
	                }
	            }
	        },

	        find = curry(findFn, 2),

	        findIndex = curry(function(fn, target){
	            return findFn(fn, target, function(it, i){
	                return i
	            })
	        }),

	        bindFunctionsOf = function(obj) {
	            Object.keys(obj).forEach(function(k){
	                if (typeof obj[k] == 'function'){
	                    obj[k] = obj[k].bind(obj)
	                }
	            })

	            return obj
	        },

	        /*
	         * @param {Function...} an enumeration of functions, each consuming the result of the following function.
	         *
	         * For example: compose(c, b, a)(1,4) == c(b(a(1,4)))
	         *
	         * @return the result of the first function in the enumeration
	         */
	        compose = __webpack_require__(52),

	        chain = __webpack_require__(53),

	        once = __webpack_require__(54),

	        bindArgsArray = __webpack_require__(55),

	        bindArgs = __webpack_require__(56),

	        lockArgsArray = __webpack_require__(57),

	        lockArgs = __webpack_require__(58),

	        skipArgs = function(fn, count){
	            return function(){
	                var args = SLICE.call(arguments, count || 0)

	                return fn.apply(this, args)
	            }
	        },

	        intercept = function(interceptedFn, interceptingFn, withStopArg){

	            return function(){
	                var args    = [].from(arguments),
	                    stopArg = { stop: false }

	                if (withStopArg){
	                    args.push(stopArg)
	                }

	                var result = interceptingFn.apply(this, args)

	                if (withStopArg){
	                    if (stopArg.stop === true){
	                        return result
	                    }

	                } else {
	                    if (result === false){
	                        return result
	                    }
	                }

	                //the interception was not stopped
	                return interceptedFn.apply(this, arguments)
	            }

	        },

	        delay = function(fn, delay, scope){

	            var delayIsNumber = delay * 1 == delay

	            if (arguments.length == 2 && !delayIsNumber){
	                scope = delay
	                delay = 0
	            } else {
	                if (!delayIsNumber){
	                    delay = 0
	                }
	            }

	            return function(){
	                var self = scope || this,
	                    args = arguments

	                if (delay < 0){
	                    fn.apply(self, args)
	                    return
	                }

	                if (delay || !setImmediate){
	                    setTimeout(function(){
	                        fn.apply(self, args)
	                    }, delay)

	                } else {
	                    setImmediate(function(){
	                        fn.apply(self, args)
	                    })
	                }
	            }
	        },

	        defer = function(fn, scope){
	            return delay(fn, 0, scope)
	        },

	        buffer = function(fn, delay, scope){

	            var timeoutId = -1

	            return function(){

	                var self = scope || this,
	                    args = arguments

	                if (delay < 0){
	                    fn.apply(self, args)
	                    return
	                }

	                var withTimeout = delay || !setImmediate,
	                    clearFn = withTimeout?
	                                clearTimeout:
	                                clearImmediate,
	                    setFn   = withTimeout?
	                                setTimeout:
	                                setImmediate

	                if (timeoutId !== -1){
	                    clearFn(timeoutId)
	                }

	                timeoutId = setFn(function(){
	                    fn.apply(self, args)
	                    self = null
	                }, delay)

	            }

	        },

	        throttle = function(fn, delay, scope) {
	            var timeoutId = -1,
	                self,
	                args

	            return function () {

	                self = scope || this
	                args = arguments

	                if (timeoutId !== -1) {
	                    //the function was called once again in the delay interval
	                } else {
	                    timeoutId = setTimeout(function () {
	                        fn.apply(self, args)

	                        self = null
	                        timeoutId = -1
	                    }, delay)
	                }

	            }

	        },

	        spread = function(fn, delay, scope){

	            var timeoutId       = -1
	            var callCount       = 0
	            var executeCount    = 0
	            var nextArgs        = {}
	            var increaseCounter = true
	            var resultingFnUnbound
	            var resultingFn

	            resultingFn = resultingFnUnbound = function(){

	                var args = arguments,
	                    self = scope || this

	                if (increaseCounter){
	                    nextArgs[callCount++] = {args: args, scope: self}
	                }

	                if (timeoutId !== -1){
	                    //the function was called once again in the delay interval
	                } else {
	                    timeoutId = setTimeout(function(){
	                        fn.apply(self, args)

	                        timeoutId = -1
	                        executeCount++

	                        if (callCount !== executeCount){
	                            resultingFn = bindArgsArray(resultingFnUnbound, nextArgs[executeCount].args).bind(nextArgs[executeCount].scope)
	                            delete nextArgs[executeCount]

	                            increaseCounter = false
	                            resultingFn.apply(self)
	                            increaseCounter = true
	                        } else {
	                            nextArgs = {}
	                        }
	                    }, delay)
	                }

	            }

	            return resultingFn
	        },

	        /*
	         * @param {Array} args the array for which to create a cache key
	         * @param {Number} [cacheParamNumber] the number of args to use for the cache key. Use this to limit the args that area actually used for the cache key
	         */
	        getCacheKey = function(args, cacheParamNumber){
	            if (cacheParamNumber == null){
	                cacheParamNumber = -1
	            }

	            var i        = 0,
	                len      = Math.min(args.length, cacheParamNumber),
	                cacheKey = [],
	                it

	            for ( ; i < len; i++){
	                it = args[i]

	                if (root.check.isPlainObject(it) || Array.isArray(it)){
	                    cacheKey.push(JSON.stringify(it))
	                } else {
	                    cacheKey.push(String(it))
	                }
	            }

	            return cacheKey.join(', ')
	        },

	        /*
	         * @param {Function} fn - the function to cache results for
	         * @param {Number} skipCacheParamNumber - the index of the boolean parameter that makes this function skip the caching and
	         * actually return computed results.
	         * @param {Function|String} cacheBucketMethod - a function or the name of a method on this object which makes caching distributed across multiple buckets.
	         * If given, cached results will be searched into the cache corresponding to this bucket. If no result found, return computed result.
	         *
	         * For example this param is very useful when a function from a prototype is cached,
	         * but we want to return the same cached results only for one object that inherits that proto, not for all objects. Thus, for example for Wes.Element,
	         * we use the 'getId' cacheBucketMethod to indicate cached results for one object only.
	         * @param {Function} [cacheKeyBuilder] A function to be used to compose the cache key
	         *
	         * @return {Function} a new function, which returns results from cache, if they are available, otherwise uses the given fn to compute the results.
	         * This returned function has a 'clearCache' function attached, which clears the caching. If a parameter ( a bucket id) is  provided,
	         * only clears the cache in the specified cache bucket.
	         */
	        cache = function(fn, config){
	            config = config || {}

	            var bucketCache = {},
	                cache       = {},
	                skipCacheParamNumber = config.skipCacheIndex,
	                cacheBucketMethod    = config.cacheBucket,
	                cacheKeyBuilder      = config.cacheKey,
	                cacheArgsLength      = skipCacheParamNumber == null?
	                                            fn.length:
	                                            skipCacheParamNumber,
	                cachingFn

	            cachingFn = function(){
	                var result,
	                    skipCache = skipCacheParamNumber != null?
	                                                arguments[skipCacheParamNumber] === true:
	                                                false,
	                    args = skipCache?
	                                    SLICE.call(arguments, 0, cacheArgsLength):
	                                    SLICE.call(arguments),

	                    cacheBucketId = cacheBucketMethod != null?
	                                        typeof cacheBucketMethod == 'function'?
	                                            cacheBucketMethod():
	                                            typeof this[cacheBucketMethod] == 'function'?
	                                                this[cacheBucketMethod]():
	                                                null
	                                        :
	                                        null,


	                    cacheObject = cacheBucketId?
	                                        bucketCache[cacheBucketId]:
	                                        cache,

	                    cacheKey = (cacheKeyBuilder || getCacheKey)(args, cacheArgsLength)

	                if (cacheBucketId && !cacheObject){
	                    cacheObject = bucketCache[cacheBucketId] = {}
	                }

	                if (skipCache || cacheObject[cacheKey] == null){
	                    cacheObject[cacheKey] = result = fn.apply(this, args)
	                } else {
	                    result = cacheObject[cacheKey]
	                }

	                return result
	            }

	            /*
	             * @param {String|Object|Number} [bucketId] the bucket for which to clear the cache. If none given, clears all the cache for this function.
	             */
	            cachingFn.clearCache = function(bucketId){
	                if (bucketId){
	                    delete bucketCache[String(bucketId)]
	                } else {
	                    cache = {}
	                    bucketCache = {}
	                }
	            }

	            /*
	             *
	             * @param {Array} cacheArgs The array of objects from which to create the cache key
	             * @param {Number} [cacheParamNumber] A limit for the cache args that are actually used to compute the cache key.
	             * @param {Function} [cacheKeyBuilder] The function to be used to compute the cache key from the given cacheArgs and cacheParamNumber
	             */
	            cachingFn.getCache = function(cacheArgs, cacheParamNumber, cacheKeyBuilder){
	                return cachingFn.getBucketCache(null, cacheArgs, cacheParamNumber, cacheKeyBuilder)
	            }

	            /*
	             *
	             * @param {String} bucketId The id of the cache bucket from which to retrieve the cached value
	             * @param {Array} cacheArgs The array of objects from which to create the cache key
	             * @param {Number} [cacheParamNumber] A limit for the cache args that are actually used to compute the cache key.
	             * @param {Function} [cacheKeyBuilder] The function to be used to compute the cache key from the given cacheArgs and cacheParamNumber
	             */
	            cachingFn.getBucketCache = function(bucketId, cacheArgs, cacheParamNumber, cacheKeyBuilder){
	                var cacheObject = cache,
	                    cacheKey = (cacheKeyBuilder || getCacheKey)(cacheArgs, cacheParamNumber)

	                if (bucketId){
	                    bucketId = String(bucketId);

	                    cacheObject = bucketCache[bucketId] = bucketCache[bucketId] || {}
	                }

	                return cacheObject[cacheKey]
	            }

	            /*
	             *
	             * @param {Object} value The value to set in the cache
	             * @param {Array} cacheArgs The array of objects from which to create the cache key
	             * @param {Number} [cacheParamNumber] A limit for the cache args that are actually used to compute the cache key.
	             * @param {Function} [cacheKeyBuilder] The function to be used to compute the cache key from the given cacheArgs and cacheParamNumber
	             */
	            cachingFn.setCache = function(value, cacheArgs, cacheParamNumber, cacheKeyBuilder){
	                return cachingFn.setBucketCache(null, value, cacheArgs, cacheParamNumber, cacheKeyBuilder)
	            }

	            /*
	             *
	             * @param {String} bucketId The id of the cache bucket for which to set the cache value
	             * @param {Object} value The value to set in the cache
	             * @param {Array} cacheArgs The array of objects from which to create the cache key
	             * @param {Number} [cacheParamNumber] A limit for the cache args that are actually used to compute the cache key.
	             * @param {Function} [cacheKeyBuilder] The function to be used to compute the cache key from the given cacheArgs and cacheParamNumber
	             */
	            cachingFn.setBucketCache = function(bucketId, value, cacheArgs, cacheParamNumber, cacheKeyBuilder){

	                var cacheObject = cache,
	                    cacheKey = (cacheKeyBuilder || getCacheKey)(cacheArgs, cacheParamNumber)

	                if (bucketId){
	                    bucketId = String(bucketId)

	                    cacheObject = bucketCache[bucketId] = bucketCache[bucketId] || {};
	                }

	                return cacheObject[cacheKey] = value
	            }

	            return cachingFn
	        }

	module.exports = {

	    map: __webpack_require__(59),

	    dot: __webpack_require__(60),

	    maxArgs: __webpack_require__(61),

	    /**
	     * @method compose
	     *
	     * Example:
	     *
	     *      zippy.Function.compose(c, b, a)
	     *
	     * See {@link Function#compose}
	     */
	    compose: compose,

	    /**
	     * See {@link Function#self}
	     */
	    self: function(fn){
	        return fn
	    },

	    /**
	     * See {@link Function#buffer}
	     */
	    buffer: buffer,

	    /**
	     * See {@link Function#delay}
	     */
	    delay: delay,

	    /**
	     * See {@link Function#defer}
	     * @param {Function} fn
	     * @param {Object} scope
	     */
	    defer:defer,

	    /**
	     * See {@link Function#skipArgs}
	     * @param {Function} fn
	     * @param {Number} [count=0] how many args to skip when calling the resulting function
	     * @return {Function} The function that will call the original fn without the first count args.
	     */
	    skipArgs: skipArgs,

	    /**
	     * See {@link Function#intercept}
	     */
	    intercept: function(fn, interceptedFn, withStopArgs){
	        return intercept(interceptedFn, fn, withStopArgs)
	    },

	    /**
	     * See {@link Function#throttle}
	     */
	    throttle: throttle,

	    /**
	     * See {@link Function#spread}
	     */
	    spread: spread,

	    /**
	     * See {@link Function#chain}
	     */
	    chain: function(fn, where, mainFn){
	        return chain(where, mainFn, fn)
	    },

	    /**
	     * See {@link Function#before}
	     */
	    before: function(fn, otherFn){
	        return chain('before', otherFn, fn)
	    },

	    /**
	     * See {@link Function#after}
	     */
	    after: function(fn, otherFn){
	        return chain('after', otherFn, fn)
	    },

	    /**
	     * See {@link Function#curry}
	     */
	    curry: curry,

	    /**
	     * See {@link Function#once}
	     */
	    once: once,

	    /**
	     * See {@link Function#bindArgs}
	     */
	    bindArgs: bindArgs,

	    /**
	     * See {@link Function#bindArgsArray}
	     */
	    bindArgsArray: bindArgsArray,

	    /**
	     * See {@link Function#lockArgs}
	     */
	    lockArgs: lockArgs,

	    /**
	     * See {@link Function#lockArgsArray}
	     */
	    lockArgsArray: lockArgsArray,

	    bindFunctionsOf: bindFunctionsOf,

	    find: find,

	    findIndex: findIndex,

	    newify: __webpack_require__(62)
	}

/***/ },
/* 51 */
/***/ function(module, exports) {

	'use strict'

	function curry(fn, n){

	    if (typeof n !== 'number'){
	        n = fn.length
	    }

	    function getCurryClosure(prevArgs){

	        function curryClosure() {

	            var len  = arguments.length
	            var args = [].concat(prevArgs)

	            if (len){
	                args.push.apply(args, arguments)
	            }

	            if (args.length < n){
	                return getCurryClosure(args)
	            }

	            return fn.apply(this, args)
	        }

	        return curryClosure
	    }

	    return getCurryClosure([])
	}

	module.exports = curry

/***/ },
/* 52 */
/***/ function(module, exports) {

	'use strict'

	function composeTwo(f, g) {
	    return function () {
	        return f(g.apply(this, arguments))
	    }
	}

	/*
	 * @param {Function...} an enumeration of functions, each consuming the result of the following function.
	 *
	 * For example: compose(c, b, a)(1,4) == c(b(a(1,4)))
	 *
	 * @return the result of the first function in the enumeration
	 */
	module.exports = function(){

	    var args = arguments
	    var len  = args.length
	    var i    = 0
	    var f    = args[0]

	    while (++i < len) {
	        f = composeTwo(f, args[i])
	    }

	    return f
	}

/***/ },
/* 53 */
/***/ function(module, exports) {

	'use strict'

	function chain(where, fn, secondFn){

	    return function(){
	        if (where === 'before'){
	            secondFn.apply(this, arguments)
	        }

	        var result = fn.apply(this, arguments)

	        if (where !== 'before'){
	            secondFn.apply(this, arguments)
	        }

	        return result
	    }
	}

	module.exports = chain

/***/ },
/* 54 */
/***/ function(module, exports) {

	'use once'

	function once(fn, scope){

	    var called
	    var result

	    return function(){
	        if (called){
	            return result
	        }

	        called = true

	        return result = fn.apply(scope || this, arguments)
	    }
	}

	module.exports = once

/***/ },
/* 55 */
/***/ function(module, exports) {

	'use strict'

	var SLICE = Array.prototype.slice

	module.exports = function(fn, args){
	    return function(){
	        var thisArgs = SLICE.call(args || [])

	        if (arguments.length){
	            thisArgs.push.apply(thisArgs, arguments)
	        }

	        return fn.apply(this, thisArgs)
	    }
	}

/***/ },
/* 56 */
/***/ function(module, exports, __webpack_require__) {

	'use strict'

	var SLICE = Array.prototype.slice
	var bindArgsArray = __webpack_require__(55)

	module.exports = function(fn){
	    return bindArgsArray(fn, SLICE.call(arguments,1))
	}

/***/ },
/* 57 */
/***/ function(module, exports) {

	'use strict'

	var SLICE = Array.prototype.slice

	module.exports = function(fn, args){

	    return function(){
	        if (!Array.isArray(args)){
	            args = SLICE.call(args || [])
	        }

	        return fn.apply(this, args)
	    }
	}

/***/ },
/* 58 */
/***/ function(module, exports, __webpack_require__) {

	'use strict'

	var SLICE = Array.prototype.slice
	var lockArgsArray = __webpack_require__(57)

	module.exports = function(fn){
	    return lockArgsArray(fn, SLICE.call(arguments, 1))
	}

/***/ },
/* 59 */
/***/ function(module, exports, __webpack_require__) {

	'use strict'

	var curry = __webpack_require__(51)

	module.exports = curry(function(fn, value){
	    return value != undefined && typeof value.map?
	            value.map(fn):
	            fn(value)
	})

/***/ },
/* 60 */
/***/ function(module, exports, __webpack_require__) {

	'use strict'

	var curry = __webpack_require__(51)

	module.exports = curry(function(prop, value){
	    return value != undefined? value[prop]: undefined
	})

/***/ },
/* 61 */
/***/ function(module, exports, __webpack_require__) {

	'use strict'

	var SLICE = Array.prototype.slice
	var curry = __webpack_require__(51)

	module.exports = function(fn, count){
	    return function(){
	        return fn.apply(this, SLICE.call(arguments, 0, count))
	    }
	}

/***/ },
/* 62 */
/***/ function(module, exports, __webpack_require__) {

	'use strict'

	var newify = __webpack_require__(63)
	var curry  = __webpack_require__(51)

	module.exports = curry(newify)

/***/ },
/* 63 */
/***/ function(module, exports, __webpack_require__) {

	var getInstantiatorFunction = __webpack_require__(64)

	module.exports = function(fn, args){
		return getInstantiatorFunction(args.length)(fn, args)
	}

/***/ },
/* 64 */
/***/ function(module, exports) {

	module.exports = function(){

	    'use strict';

	    var fns = {}

	    return function(len){

	        if ( ! fns [len ] ) {

	            var args = []
	            var i    = 0

	            for (; i < len; i++ ) {
	                args.push( 'a[' + i + ']')
	            }

	            fns[len] = new Function(
	                            'c',
	                            'a',
	                            'return new c(' + args.join(',') + ')'
	                        )
	        }

	        return fns[len]
	    }

	}()

/***/ },
/* 65 */
/***/ function(module, exports) {

	'use strict'

	var regex = /^[A-F0-9]{8}(?:-?[A-F0-9]{4}){3}-?[A-F0-9]{12}$/i
	var regex2 = /^\{[A-F0-9]{8}(?:-?[A-F0-9]{4}){3}-?[A-F0-9]{12}\}$/i

	module.exports = function(value){
	    return regex.test(value) || regex2.test(value)
	}



/***/ },
/* 66 */
/***/ function(module, exports, __webpack_require__) {

	'use strict'

	module.exports = __webpack_require__(67).numeric

/***/ },
/* 67 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(68)

/***/ },
/* 68 */
/***/ function(module, exports, __webpack_require__) {

	'use strict'

	module.exports = {
	    'numeric'  : __webpack_require__(69),
	    'number'   : __webpack_require__(70),
	    'int'      : __webpack_require__(71),
	    'float'    : __webpack_require__(72),
	    'string'   : __webpack_require__(73),
	    'function' : __webpack_require__(74),
	    'object'   : __webpack_require__(75),
	    'arguments': __webpack_require__(76),
	    'boolean'  : __webpack_require__(77),
	    'date'     : __webpack_require__(78),
	    'regexp'   : __webpack_require__(79),
	    'array'    : __webpack_require__(80)
	}

/***/ },
/* 69 */
/***/ function(module, exports) {

	'use strict'

	module.exports = function(value){
	    return !isNaN( parseFloat( value ) ) && isFinite( value )
	}

/***/ },
/* 70 */
/***/ function(module, exports) {

	'use strict'

	module.exports = function(value){
	    return typeof value === 'number' && isFinite(value)
	}

/***/ },
/* 71 */
/***/ function(module, exports, __webpack_require__) {

	'use strict'

	var number = __webpack_require__(70)

	module.exports = function(value){
	    return number(value) && (value === parseInt(value, 10))
	}

/***/ },
/* 72 */
/***/ function(module, exports, __webpack_require__) {

	'use strict'

	var number = __webpack_require__(70)

	module.exports = function(value){
	    return number(value) && (value === parseFloat(value, 10)) && !(value === parseInt(value, 10))
	}

/***/ },
/* 73 */
/***/ function(module, exports) {

	'use strict'

	module.exports = function(value){
	    return typeof value == 'string'
	}

/***/ },
/* 74 */
/***/ function(module, exports) {

	'use strict'

	var objectToString = Object.prototype.toString

	module.exports = function(value){
	    return objectToString.apply(value) === '[object Function]'
	}

/***/ },
/* 75 */
/***/ function(module, exports) {

	'use strict'

	var objectToString = Object.prototype.toString

	module.exports = function(value){
	    return objectToString.apply(value) === '[object Object]'
	}

/***/ },
/* 76 */
/***/ function(module, exports) {

	'use strict'

	var objectToString = Object.prototype.toString

	module.exports = function(value){
	    return objectToString.apply(value) === '[object Arguments]' || !!value.callee
	}

/***/ },
/* 77 */
/***/ function(module, exports) {

	'use strict'

	module.exports = function(value){
	    return typeof value == 'boolean'
	}

/***/ },
/* 78 */
/***/ function(module, exports) {

	'use strict'

	var objectToString = Object.prototype.toString

	module.exports = function(value){
	    return objectToString.apply(value) === '[object Date]'
	}

/***/ },
/* 79 */
/***/ function(module, exports) {

	'use strict'

	var objectToString = Object.prototype.toString

	module.exports = function(value){
	    return objectToString.apply(value) === '[object RegExp]'
	}

/***/ },
/* 80 */
/***/ function(module, exports) {

	'use strict'

	module.exports = function(value){
	    return Array.isArray(value)
	}

/***/ },
/* 81 */
/***/ function(module, exports) {

	'use strict';

	function val(fn) {

	    return function (props, propName) {

	        return fn(props[propName], propName, props);
	    };
	}

	module.exports = {
	    numeric: val(function (value, propName) {

	        if (value == null) {
	            return;
	        }
	        if (value * 1 != value) {
	            return new Error('Invalid numeric value for ' + propName);
	        }
	    }),

	    sortInfo: val(function (value) {
	        if (typeof value == 'string' || typeof value == 'number') {
	            return new Error('Invalid sortInfo specified');
	        }
	    }),

	    column: val(function (value, props, propName) {

	        if (!value) {
	            return new Error('No columns specified. Please specify at least one column!');
	        }

	        if (!Array.isArray(value)) {
	            value = props[propName] = [value];
	        }

	        var err;

	        value.some(function (col, index) {
	            if (!col.name) {
	                err = new Error('All grid columns must have a name! Column at index ' + index + ' has no name!');
	                return true;
	            }
	        });

	        return err;
	    })
	};

/***/ },
/* 82 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

	var React = __webpack_require__(6);
	var assign = __webpack_require__(7);
	var Scroller = __webpack_require__(83);

	function emptyFn() {}

	module.exports = React.createClass({

	    displayName: 'ReactDataGrid.Wrapper',

	    propTypes: {
	        scrollLeft: React.PropTypes.number,
	        scrollTop: React.PropTypes.number,
	        scrollbarSize: React.PropTypes.number,
	        rowHeight: React.PropTypes.any,
	        renderCount: React.PropTypes.number
	    },

	    getDefaultProps: function getDefaultProps() {
	        return {
	            scrollLeft: 0,
	            scrollTop: 0
	        };
	    },

	    onMount: function onMount(scroller) {
	        ;(this.props.onMount || emptyFn)(this, scroller);
	    },

	    render: function render() {

	        var props = this.prepareProps(this.props);
	        var rowsCount = props.renderCount;

	        var groupsCount = 0;
	        if (props.groupData) {
	            groupsCount = props.groupData.groupsCount;
	        }

	        rowsCount += groupsCount;

	        // var loadersSize = props.loadersSize
	        var verticalScrollerSize = (props.totalLength + groupsCount) * props.rowHeight; // + loadersSize

	        var content = props.empty ? React.createElement(
	            'div',
	            { className: 'z-empty-text', style: props.emptyTextStyle },
	            props.emptyText
	        ) : React.createElement('div', _extends({}, props.tableProps, { ref: 'table' }));

	        return React.createElement(
	            Scroller,
	            {
	                onMount: this.onMount,
	                preventDefaultHorizontal: true,

	                loadMask: !props.loadMaskOverHeader,
	                loading: props.loading,

	                scrollbarSize: props.scrollbarSize,

	                minVerticalScrollStep: props.rowHeight,
	                scrollTop: props.scrollTop,
	                scrollLeft: props.scrollLeft,

	                scrollHeight: verticalScrollerSize,
	                scrollWidth: props.minRowWidth,

	                onVerticalScroll: this.onVerticalScroll,
	                onHorizontalScroll: this.onHorizontalScroll
	            },
	            content
	        );
	    },

	    onVerticalScrollOverflow: function onVerticalScrollOverflow() {},

	    onHorizontalScrollOverflow: function onHorizontalScrollOverflow() {},

	    onHorizontalScroll: function onHorizontalScroll(scrollLeft) {
	        this.props.onScrollLeft(scrollLeft);
	    },

	    onVerticalScroll: function onVerticalScroll(pos) {
	        this.props.onScrollTop(pos);
	    },

	    prepareProps: function prepareProps(thisProps) {
	        var props = {};

	        assign(props, thisProps);

	        return props;
	    }
	});

/***/ },
/* 83 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(global) {'use strict';

	Object.defineProperty(exports, '__esModule', {
		value: true
	});

	var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

	var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

	function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

	var _reactClass = __webpack_require__(84);

	var _reactClass2 = _interopRequireDefault(_reactClass);

	var React = __webpack_require__(6);
	var LoadMask = __webpack_require__(8);
	var assign = __webpack_require__(7);
	var DragHelper = __webpack_require__(86);
	var normalize = __webpack_require__(21);
	var hasTouch = __webpack_require__(94);

	var preventDefault = function preventDefault(event) {
		return event && event.preventDefault();
	};
	var signum = function signum(x) {
		return x < 0 ? -1 : 1;
	};
	var emptyFn = function emptyFn() {};
	var ABS = Math.abs;

	var LoadMaskFactory = React.createFactory(LoadMask);

	var horizontalScrollbarStyle = {};

	var IS_MAC = global && global.navigator && global.navigator.appVersion && global.navigator.appVersion.indexOf("Mac") != -1;
	var IS_FIREFOX = global && global.navigator && global.navigator.userAgent && !! ~global.navigator.userAgent.toLowerCase().indexOf('firefox');

	if (IS_MAC) {
		horizontalScrollbarStyle.position = 'absolute';
		// horizontalScrollbarStyle.height   = 20
		horizontalScrollbarStyle.height = IS_FIREFOX ? 20 : 10;
	}

	var PT = React.PropTypes;
	var DISPLAY_NAME = 'Scroller';

	var ON_OVERFLOW_NAMES = {
		vertical: 'onVerticalScrollOverflow',
		horizontal: 'onHorizontalScrollOverflow'
	};

	var ON_SCROLL_NAMES = {
		vertical: 'onVerticalScroll',
		horizontal: 'onHorizontalScroll'
	};

	/**
	 * Called on scroll by mouse wheel
	 */
	var syncScrollbar = function syncScrollbar(orientation) {

		return function (scrollPos, event) {

			var domNode = orientation == 'horizontal' ? this.getHorizontalScrollbarNode() : this.getVerticalScrollbarNode();
			var scrollPosName = orientation == 'horizontal' ? 'scrollLeft' : 'scrollTop';
			var overflowCallback;

			domNode[scrollPosName] = scrollPos;

			var newScrollPos = domNode[scrollPosName];

			if (newScrollPos != scrollPos) {
				// overflowCallback = this.props[ON_OVERFLOW_NAMES[orientation]]
				// overflowCallback && overflowCallback(signum(scrollPos), newScrollPos)
			} else {
					preventDefault(event);
				}
		};
	};

	var syncHorizontalScrollbar = syncScrollbar('horizontal');
	var syncVerticalScrollbar = syncScrollbar('vertical');

	var scrollAt = function scrollAt(orientation) {
		var syncFn = orientation == 'horizontal' ? syncHorizontalScrollbar : syncVerticalScrollbar;

		return function (scrollPos, event) {
			// this.mouseWheelScroll = true

			syncFn.call(this, Math.round(scrollPos), event);

			// raf(function(){
			//     this.mouseWheelScroll = false
			// }.bind(this))
		};
	};

	var onScroll = function onScroll(orientation) {

		var clientHeightNames = {
			vertical: 'clientHeight',
			horizontal: 'clientWidth'
		};

		var scrollHeightNames = {
			vertical: 'scrollHeight',
			horizontal: 'scrollWidth'
		};

		return function (event) {

			var scrollPosName = orientation == 'horizontal' ? 'scrollLeft' : 'scrollTop';
			var target = event.target;
			var scrollPos = target[scrollPosName];

			var onScroll = this.props[ON_SCROLL_NAMES[orientation]];
			var onOverflow = this.props[ON_OVERFLOW_NAMES[orientation]];

			// if (!this.mouseWheelScroll && onOverflow){
			if (onOverflow) {
				if (scrollPos == 0) {
					onOverflow(-1, scrollPos);
				} else if (scrollPos + target[clientHeightNames[orientation]] >= target[scrollHeightNames[orientation]]) {
					onOverflow(1, scrollPos);
				}
			}

			;(onScroll || emptyFn)(scrollPos);
		};
	};

	/**
	 * The scroller can have a load mask (loadMask prop is true by default),
	 * you just need to specify loading=true to see it in action
	 *
	 * <Scroller loading={true} />
	 *
	 * If you don't want a load mask, specify
	 *
	 * <Scroller loadMask={false} />
	 *
	 * Or if you want to customize the loadMask factory, specify
	 *
	 * function mask(props) { return aMaskFactory(props) }
	 * <Scroller loading={true} loadMask={mask}
	 *
	 */

	var Scroller = (function (_Component) {
		_inherits(Scroller, _Component);

		function Scroller() {
			_classCallCheck(this, Scroller);

			_get(Object.getPrototypeOf(Scroller.prototype), 'constructor', this).apply(this, arguments);
		}

		_createClass(Scroller, [{
			key: 'render',
			value: function render() {
				var props = this.p = this.prepareProps(this.props);

				var loadMask = this.renderLoadMask(props);
				var horizontalScrollbar = this.renderHorizontalScrollbar(props);
				var verticalScrollbar = this.renderVerticalScrollbar(props);

				var events = {};

				if (!hasTouch) {
					events.onWheel = this.handleWheel;
				} else {
					events.onTouchStart = this.handleTouchStart;
				}

				//extra div needed for SAFARI V SCROLL
				//maxWidth needed for FF - see
				//http://stackoverflow.com/questions/27424831/firefox-flexbox-overflow
				//http://stackoverflow.com/questions/27472595/firefox-34-ignoring-max-width-for-flexbox
				var content = React.createElement('div', { className: 'z-content-wrapper-fix', style: { maxWidth: 'calc(100% - ' + props.scrollbarSize + 'px)' },
					children: props.children });

				var renderProps = this.prepareRenderProps(props);

				return React.createElement(
					'div',
					renderProps,
					loadMask,
					React.createElement(
						'div',
						_extends({ className: 'z-content-wrapper' }, events),
						content,
						verticalScrollbar
					),
					horizontalScrollbar
				);
			}
		}, {
			key: 'prepareRenderProps',
			value: function prepareRenderProps(props) {
				var renderProps = assign({}, props);

				delete renderProps.height;
				delete renderProps.width;

				return renderProps;
			}
		}, {
			key: 'handleTouchStart',
			value: function handleTouchStart(event) {

				var props = this.props;
				var scroll = {
					top: props.scrollTop,
					left: props.scrollLeft
				};

				var newScrollPos;
				var side;

				DragHelper(event, {
					scope: this,
					onDrag: function onDrag(event, config) {
						if (config.diff.top == 0 && config.diff.left == 0) {
							return;
						}

						if (!side) {
							side = ABS(config.diff.top) > ABS(config.diff.left) ? 'top' : 'left';
						}

						var diff = config.diff[side];

						newScrollPos = scroll[side] - diff;

						if (side == 'top') {
							this.verticalScrollAt(newScrollPos, event);
						} else {
							this.horizontalScrollAt(newScrollPos, event);
						}
					}
				});

				event.stopPropagation();
				preventDefault(event);
			}
		}, {
			key: 'handleWheel',
			value: function handleWheel(event) {

				var props = this.props;
				// var normalizedEvent = normalizeWheel(event)

				var virtual = props.virtualRendering;
				if (IS_MAC) {
					var horizontal = Math.abs(event.deltaX) > Math.abs(event.deltaY);
				} else {
					var horizontal = event.shiftKey;
				}
				var scrollStep = props.scrollStep;
				var minScrollStep = props.minScrollStep;

				var scrollTop = props.scrollTop;
				var scrollLeft = props.scrollLeft;

				// var delta = normalizedEvent.pixelY
				var delta = event.deltaY;

				if (horizontal) {
					if (IS_MAC) {
						delta = event.deltaX;
					} else {
						delta = delta || normalizedEvent.pixelX;
						delta = delta || event.deltaX;
					}

					minScrollStep = props.minHorizontalScrollStep || minScrollStep;
				} else {
					if (delta !== 0) minScrollStep = props.minVerticalScrollStep || minScrollStep;
				}

				if (typeof props.interceptWheelScroll == 'function') {
					delta = props.interceptWheelScroll(delta, normalizedEvent, event);
				} else if (minScrollStep) {
					if (ABS(delta) < minScrollStep && delta !== 0) {
						delta = signum(delta) * minScrollStep;
					}
				}

				if (horizontal) {
					this.horizontalScrollAt(scrollLeft + delta, event);

					props.preventDefaultHorizontal && preventDefault(event);
				} else {
					if (delta !== 0) {
						this.verticalScrollAt(scrollTop + delta, event);

						props.preventDefaultVertical && preventDefault(event);
					}
				}
			}
		}, {
			key: 'componentWillReceiveProps',
			value: function componentWillReceiveProps() {
				setTimeout(this.fixHorizontalScrollbar, 0);
			}
		}, {
			key: 'componentDidMount',
			value: function componentDidMount() {
				this.fixHorizontalScrollbar();(this.props.onMount || emptyFn)(this);

				setTimeout((function () {
					this.fixHorizontalScrollbar();
				}).bind(this), 0);
			}
		}, {
			key: 'fixHorizontalScrollbar',
			value: function fixHorizontalScrollbar() {
				this.horizontalScrollerNode = this.horizontalScrollerNode || React.findDOMNode(this).querySelector('.z-horizontal-scroller');

				var dom = this.horizontalScrollerNode;

				if (dom) {
					var height = dom.style.height;

					dom.style.height = height == '0.2px' ? '0.1px' : '0.2px';
				}
			}
		}, {
			key: 'getVerticalScrollbarNode',
			value: function getVerticalScrollbarNode() {
				return this.verticalScrollbarNode = this.verticalScrollbarNode || React.findDOMNode(this).querySelector('.ref-verticalScrollbar');
			}
		}, {
			key: 'getHorizontalScrollbarNode',
			value: function getHorizontalScrollbarNode() {
				return this.horizontalScrollbarNode = this.horizontalScrollbarNode || React.findDOMNode(this).querySelector('.ref-horizontalScrollbar');
			}
		}, {
			key: 'componentWillUnmount',
			value: function componentWillUnmount() {
				delete this.horizontalScrollerNode;
				delete this.horizontalScrollbarNode;
				delete this.verticalScrollbarNode;
			}

			////////////////////////////////////////////////
			//
			// RENDER METHODS
			//
			////////////////////////////////////////////////
		}, {
			key: 'renderVerticalScrollbar',
			value: function renderVerticalScrollbar(props) {
				var height = props.scrollHeight;
				var verticalScrollbarStyle = {
					width: props.scrollbarSize
				};

				var onScroll = this.onVerticalScroll;

				return React.createElement(
					'div',
					{ className: 'z-vertical-scrollbar', style: verticalScrollbarStyle },
					React.createElement(
						'div',
						{
							className: 'ref-verticalScrollbar',
							onScroll: onScroll,
							style: { overflow: 'auto', width: '100%', height: '100%' }
						},
						React.createElement('div', { className: 'z-vertical-scroller', style: { height: height } })
					)
				);
			}
		}, {
			key: 'renderHorizontalScrollbar',
			value: function renderHorizontalScrollbar(props) {
				var scrollbar;
				var onScroll = this.onHorizontalScroll;
				var style = horizontalScrollbarStyle;
				var minWidth = props.scrollWidth;

				var scroller = React.createElement('div', { xref: 'horizontalScroller', className: 'z-horizontal-scroller', style: { width: minWidth } });

				if (IS_MAC) {
					//needed for mac safari
					scrollbar = React.createElement(
						'div',
						{
							style: style,
							className: 'z-horizontal-scrollbar mac-fix'
						},
						React.createElement(
							'div',
							{
								onScroll: onScroll,
								className: 'ref-horizontalScrollbar z-horizontal-scrollbar-fix'
							},
							scroller
						)
					);
				} else {
					scrollbar = React.createElement(
						'div',
						{
							style: style,
							className: 'ref-horizontalScrollbar z-horizontal-scrollbar',
							onScroll: onScroll
						},
						scroller
					);
				}

				return scrollbar;
			}
		}, {
			key: 'renderLoadMask',
			value: function renderLoadMask(props) {
				if (props.loadMask) {
					var loadMaskProps = assign({ visible: props.loading }, props.loadMaskProps);

					var defaultFactory = LoadMaskFactory;
					var factory = typeof props.loadMask == 'function' ? props.loadMask : defaultFactory;

					var mask = factory(loadMaskProps);

					if (mask === undefined) {
						//allow the specified factory to just modify props
						//and then leave the rendering to the defaultFactory
						mask = defaultFactory(loadMaskProps);
					}

					return mask;
				}
			}

			////////////////////////////////////////////////
			//
			// PREPARE PROPS METHODS
			//
			////////////////////////////////////////////////
		}, {
			key: 'prepareProps',
			value: function prepareProps(thisProps) {
				var props = assign({}, thisProps);

				props.className = this.prepareClassName(props);
				props.style = this.prepareStyle(props);

				return props;
			}
		}, {
			key: 'prepareStyle',
			value: function prepareStyle(props) {
				var style = assign({}, props.style);

				if (props.height != null) {
					style.height = props.height;
				}

				if (props.width != null) {
					style.width = props.width;
				}

				if (props.normalizeStyles) {
					style = normalize(style);
				}

				return style;
			}
		}, {
			key: 'prepareClassName',
			value: function prepareClassName(props) {
				var className = props.className || '';

				if (Scroller.className) {
					className += ' ' + Scroller.className;
				}

				return className;
			}
		}]);

		return Scroller;
	})(_reactClass2['default']);

	Scroller.className = 'z-scroller';
	Scroller.displayName = DISPLAY_NAME;

	assign(Scroller.prototype, {
		onVerticalScroll: onScroll('vertical'),
		onHorizontalScroll: onScroll('horizontal'),

		verticalScrollAt: scrollAt('vertical'),
		horizontalScrollAt: scrollAt('horizontal'),

		syncHorizontalScrollbar: syncHorizontalScrollbar,
		syncVerticalScrollbar: syncVerticalScrollbar
	});

	Scroller.propTypes = {
		loadMask: PT.oneOfType([PT.bool, PT.func]),

		loading: PT.bool,
		normalizeStyles: PT.bool,

		scrollTop: PT.number,
		scrollLeft: PT.number,

		scrollWidth: PT.number.isRequired,
		scrollHeight: PT.number.isRequired,

		height: PT.number,
		width: PT.number,

		minScrollStep: PT.number,
		minHorizontalScrollStep: PT.number,
		minVerticalScrollStep: PT.number,

		virtualRendering: PT.oneOf([true]),

		preventDefaultVertical: PT.bool,
		preventDefaultHorizontal: PT.bool
	}, Scroller.defaultProps = {
		'data-display-name': DISPLAY_NAME,
		loadMask: true,

		virtualRendering: true, //FOR NOW, only true is supported
		scrollbarSize: 20,

		scrollTop: 0,
		scrollLeft: 0,

		minScrollStep: 10,

		minHorizontalScrollStep: IS_FIREFOX ? 40 : 1,

		//since FF goes back in browser history on scroll too soon
		//chrome and others also do this, but the normal preventDefault in syncScrollbar fn prevents this
		preventDefaultHorizontal: IS_FIREFOX
	};

	exports['default'] = Scroller;
	module.exports = exports['default'];
	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ },
/* 84 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

	var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

	function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

	var React = __webpack_require__(6);
	var assign = __webpack_require__(85);

	function autoBind(object) {
	  var proto = object.constructor.prototype;

	  var names = Object.getOwnPropertyNames(proto).filter(function (key) {
	    return key != 'constructor' && key != 'render' && typeof proto[key] == 'function';
	  });

	  names.push('setState');
	  names.forEach(function (key) {
	    object[key] = object[key].bind(object);
	  });

	  return object;
	}

	var ReactClass = (function (_React$Component) {
	  _inherits(ReactClass, _React$Component);

	  function ReactClass(props) {
	    _classCallCheck(this, ReactClass);

	    _get(Object.getPrototypeOf(ReactClass.prototype), 'constructor', this).call(this, props);
	    autoBind(this);
	  }

	  _createClass(ReactClass, [{
	    key: 'prepareProps',
	    value: function prepareProps(thisProps) {

	      var props = assign({}, thisProps);

	      props.style = this.prepareStyle(props);
	      props.className = this.prepareClassName(props);

	      return props;
	    }
	  }, {
	    key: 'prepareClassName',
	    value: function prepareClassName(props) {
	      var className = props.className || '';

	      var defaultProps = this.constructor.defaultProps;

	      if (defaultProps && defaultProps.defaultClassName != null) {
	        className += ' ' + defaultProps.defaultClassName;
	      }

	      return className;
	    }
	  }, {
	    key: 'prepareStyle',
	    value: function prepareStyle(props) {
	      var defaultStyle;

	      if (this.constructor.defaultProps) {
	        defaultStyle = this.constructor.defaultProps.defaultStyle;
	      }

	      return assign({}, defaultStyle, props.style);
	    }
	  }]);

	  return ReactClass;
	})(React.Component);

	module.exports = ReactClass;

/***/ },
/* 85 */
/***/ function(module, exports) {

	/* eslint-disable no-unused-vars */
	'use strict';
	var hasOwnProperty = Object.prototype.hasOwnProperty;
	var propIsEnumerable = Object.prototype.propertyIsEnumerable;

	function toObject(val) {
		if (val === null || val === undefined) {
			throw new TypeError('Object.assign cannot be called with null or undefined');
		}

		return Object(val);
	}

	module.exports = Object.assign || function (target, source) {
		var from;
		var to = toObject(target);
		var symbols;

		for (var s = 1; s < arguments.length; s++) {
			from = Object(arguments[s]);

			for (var key in from) {
				if (hasOwnProperty.call(from, key)) {
					to[key] = from[key];
				}
			}

			if (Object.getOwnPropertySymbols) {
				symbols = Object.getOwnPropertySymbols(from);
				for (var i = 0; i < symbols.length; i++) {
					if (propIsEnumerable.call(from, symbols[i])) {
						to[symbols[i]] = from[symbols[i]];
					}
				}
			}
		}

		return to;
	};


/***/ },
/* 86 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var assign = __webpack_require__(7)
	var Region = __webpack_require__(87)
	var hasTouch = __webpack_require__(92)
	var once   = __webpack_require__(93)

	var Helper = function(config){
	    this.config = config
	}

	var EVENTS = {
	    move: hasTouch? 'touchmove': 'mousemove',
	    up  : hasTouch? 'touchend': 'mouseup'
	}

	function emptyFn(){}

	function getPageCoords(event){
	    var firstTouch

	    var pageX = event.pageX
	    var pageY = event.pageY

	    if (hasTouch && event.touches && (firstTouch = event.touches[0])){
	        pageX = firstTouch.pageX
	        pageY = firstTouch.pageY
	    }

	    return {
	        pageX: pageX,
	        pageY: pageY
	    }
	}

	assign(Helper.prototype, {

	    /**
	     * Should be called on a mousedown event
	     *
	     * @param  {Event} event
	     * @return {[type]}       [description]
	     */
	    initDrag: function(event) {

	        this.onDragInit(event)

	        var onDragStart = once(this.onDragStart, this)
	        var target = hasTouch?
	                        event.target:
	                        window

	        var mouseMoveListener = (function(event){
	            onDragStart(event)
	            this.onDrag(event)
	        }).bind(this)

	        var mouseUpListener = (function(event){

	            this.onDrop(event)

	            target.removeEventListener(EVENTS.move, mouseMoveListener)
	            target.removeEventListener(EVENTS.up, mouseUpListener)
	        }).bind(this)

	        target.addEventListener(EVENTS.move, mouseMoveListener, false)
	        target.addEventListener(EVENTS.up, mouseUpListener)
	    },

	    onDragInit: function(event){

	        var config = {
	            diff: {
	                left: 0,
	                top : 0
	            }
	        }
	        this.state = {
	            config: config
	        }

	        if (this.config.region){
	            this.state.initialRegion = Region.from(this.config.region)
	            this.state.dragRegion =
	                config.dragRegion =
	                    this.state.initialRegion.clone()
	        }
	        if (this.config.constrainTo){
	            this.state.constrainTo = Region.from(this.config.constrainTo)
	        }

	        this.callConfig('onDragInit', event)
	    },

	    /**
	     * Called when the first mousemove event occurs after drag is initialized
	     * @param  {Event} event
	     */
	    onDragStart: function(event){
	        this.state.initPageCoords = getPageCoords(event)

	        this.state.didDrag = this.state.config.didDrag = true
	        this.callConfig('onDragStart', event)
	    },

	    /**
	     * Called on all mousemove events after drag is initialized.
	     *
	     * @param  {Event} event
	     */
	    onDrag: function(event){

	        var config = this.state.config

	        var initPageCoords = this.state.initPageCoords
	        var eventCoords = getPageCoords(event)

	        var diff = config.diff = {
	            left: eventCoords.pageX - initPageCoords.pageX,
	            top : eventCoords.pageY - initPageCoords.pageY
	        }

	        if (this.state.initialRegion){
	            var dragRegion = config.dragRegion

	            //set the dragRegion to initial coords
	            dragRegion.set(this.state.initialRegion)

	            //shift it to the new position
	            dragRegion.shift(diff)

	            if (this.state.constrainTo){
	                //and finally constrain it if it's the case
	                dragRegion.constrainTo(this.state.constrainTo)

	                diff.left = dragRegion.left - this.state.initialRegion.left
	                diff.top  = dragRegion.top - this.state.initialRegion.top
	            }

	            config.dragRegion = dragRegion
	        }

	        this.callConfig('onDrag', event)
	    },

	    /**
	     * Called on the mouseup event on window
	     *
	     * @param  {Event} event
	     */
	    onDrop: function(event){
	        this.callConfig('onDrop', event)

	        this.state = null
	    },

	    callConfig: function(fnName, event){
	        var config = this.state.config
	        var args   = [event, config]

	        var fn = this.config[fnName]

	        if (fn){
	            fn.apply(this, args)
	        }
	    }

	})

	module.exports = function(event, config){

	    if (config.scope){
	        var skippedKeys = {
	            scope      : 1,
	            region     : 1,
	            constrainTo: 1
	        }

	        Object.keys(config).forEach(function(key){
	            var value = config[key]

	            if (key in skippedKeys){
	                return
	            }

	            if (typeof value == 'function'){
	                config[key] = value.bind(config.scope)
	            }
	        })
	    }
	    var helper = new Helper(config)

	    helper.initDrag(event)

	    return helper
	}

/***/ },
/* 87 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var Region = __webpack_require__(10)

	__webpack_require__(88)
	__webpack_require__(89)

	var COMPUTE_ALIGN_REGION = __webpack_require__(90)

	/**
	 * region-align module exposes methods for aligning {@link Element} and {@link Region} instances
	 *
	 * The #alignTo method aligns this to the target element/region using the specified positions. See #alignTo for a graphical example.
	 *
	 *
	 *      var div = Element.select('div.first')
	 *
	 *      div.alignTo(Element.select('body') , 'br-br')
	 *
	 *      //aligns the div to be in the bottom-right corner of the body
	 *
	 * Other useful methods
	 *
	 *  * {@link #alignRegions} - aligns a given source region to a target region
	 *  * {@link #COMPUTE_ALIGN_REGION} - given a source region and a target region, and alignment positions, returns a clone of the source region, but aligned to satisfy the given alignments
	 */


	/**
	 * Aligns sourceRegion to targetRegion. It modifies the sourceRegion in order to perform the correct alignment.
	 * See #COMPUTE_ALIGN_REGION for details and examples.
	 *
	 * This method calls #COMPUTE_ALIGN_REGION passing to it all its arguments. The #COMPUTE_ALIGN_REGION method returns a region that is properly aligned.
	 * If this returned region position/size differs from sourceRegion, then the sourceRegion is modified to be an exact copy of the aligned region.
	 *
	 * @inheritdoc #COMPUTE_ALIGN_REGION
	 * @return {String} the position used for alignment
	 */
	Region.alignRegions = function(sourceRegion, targetRegion, positions, config){

	    var result        = COMPUTE_ALIGN_REGION(sourceRegion, targetRegion, positions, config)
	    var alignedRegion = result.region

	    if ( !alignedRegion.equals(sourceRegion) ) {
	        sourceRegion.setRegion(alignedRegion)
	    }

	    return result.position

	}

	    /**
	     *
	     * The #alignTo method aligns this to the given target region, using the specified alignment position(s).
	     * You can also specify a constrain for the alignment.
	     *
	     * Example
	     *
	     *      BIG
	     *      ________________________
	     *      |  _______              |
	     *      | |       |             |
	     *      | |   A   |             |
	     *      | |       |      _____  |
	     *      | |_______|     |     | |
	     *      |               |  B  | |
	     *      |               |     | |
	     *      |_______________|_____|_|
	     *
	     * Assume the *BIG* outside rectangle is our constrain region, and you want to align the *A* rectangle
	     * to the *B* rectangle. Ideally, you'll want their tops to be aligned, and *A* to be placed at the right side of *B*
	     *
	     *
	     *      //so we would align them using
	     *
	     *      A.alignTo(B, 'tl-tr', { constrain: BIG })
	     *
	     * But this would result in
	     *
	     *       BIG
	     *      ________________________
	     *      |                       |
	     *      |                       |
	     *      |                       |
	     *      |                _____ _|_____
	     *      |               |     | .     |
	     *      |               |  B  | . A   |
	     *      |               |     | .     |
	     *      |_______________|_____|_._____|
	     *
	     *
	     * Which is not what we want. So we specify an array of options to try
	     *
	     *      A.alignTo(B, ['tl-tr', 'tr-tl'], { constrain: BIG })
	     *
	     * So by this we mean: try to align A(top,left) with B(top,right) and stick to the BIG constrain. If this is not possible,
	     * try the next option: align A(top,right) with B(top,left)
	     *
	     * So this is what we end up with
	     *
	     *      BIG
	     *      ________________________
	     *      |                       |
	     *      |                       |
	     *      |                       |
	     *      |        _______ _____  |
	     *      |       |       |     | |
	     *      |       |   A   |  B  | |
	     *      |       |       |     | |
	     *      |_______|_______|_____|_|
	     *
	     *
	     * Which is a lot better!
	     *
	     * @param {Element/Region} target The target to which to align this alignable.
	     *
	     * @param {String[]/String} positions The positions for the alignment.
	     *
	     * Example:
	     *
	     *      'br-tl'
	     *      ['br-tl','br-tr','cx-tc']
	     *
	     * This method will try to align using the first position. But if there is a constrain region, that position might not satisfy the constrain.
	     * If this is the case, the next positions will be tried. If one of them satifies the constrain, it will be used for aligning and it will be returned from this method.
	     *
	     * If no position matches the contrain, the one with the largest intersection of the source region with the constrain will be used, and this alignable will be resized to fit the constrain region.
	     *
	     * @param {Object} config A config object with other configuration for this method
	     *
	     * @param {Array[]/Object[]/Object} config.offset The offset to use for aligning. If more that one offset is specified, then offset at a given index is used with the position at the same index.
	     *
	     * An offset can have the following form:
	     *
	     *      [left_offset, top_offset]
	     *      {left: left_offset, top: top_offset}
	     *      {x: left_offset, y: top_offset}
	     *
	     * You can pass one offset or an array of offsets. In case you pass just one offset,
	     * it cannot have the array form, so you cannot call
	     *
	     *      this.alignTo(target, positions, [10, 20])
	     *
	     * If you do, it will not be considered. Instead, please use
	     *
	     *      this.alignTo(target, positions, {x: 10, y: 20})
	     *
	     * Or
	     *
	     *      this.alignTo(target, positions, [[10, 20]] )
	     *
	     * @param {Boolean/Element/Region} config.constrain If boolean, target will be constrained to the document region, otherwise,
	     * getRegion will be called on this argument to determine the region we need to constrain to.
	     *
	     * @param {Boolean/Object} config.sync Either boolean or an object with {width, height}. If it is boolean,
	     * both width and height will be synced. If directions are specified, will only sync the direction which is specified as true
	     *
	     * @return {String}
	     *
	     */
	Region.prototype.alignTo = function(target, positions, config){

	    config = config || {}

	    var sourceRegion = this
	    var targetRegion = Region.from(target)

	    var result = COMPUTE_ALIGN_REGION(sourceRegion, targetRegion, positions, config)
	    var resultRegion = result.region

	    if (!resultRegion.equalsSize(sourceRegion)){
	        this.setSize(resultRegion.getSize())
	    }
	    if (!resultRegion.equalsPosition(sourceRegion)){
	        this.setPosition(resultRegion.getPosition(), { absolute: !!config.absolute })
	    }

	    return result.position
	}

	module.exports = Region

/***/ },
/* 88 */
/***/ function(module, exports, __webpack_require__) {

	'use strict'

	var Region = __webpack_require__(10)

	/**
	 * @static
	 * Aligns the source region to the target region, so as to correspond to the given alignment.
	 *
	 * NOTE that this method makes changes on the sourceRegion in order for it to be aligned as specified.
	 *
	 * @param {Region} sourceRegion
	 * @param {Region} targetRegion
	 *
	 * @param {String} align A string with 2 valid align positions, eg: 'tr-bl'.
	 * For valid positions, see {@link Region#getPoint}
	 *
	 * Having 2 regions, we need to be able to align them as we wish:
	 *
	 * for example, if we have
	 *
	 *       source    target
	 *       ________________
	 *       ____
	 *      |    |     ________
	 *      |____|    |        |
	 *                |        |
	 *                |________|
	 *
	 * and we align 't-t', we get:
	 *
	 *       source    target
	 *       _________________
	 *
	 *       ____      ________
	 *      |    |    |        |
	 *      |____|    |        |
	 *                |________|
	 *
	 *  In this case, the source was moved down to be aligned to the top of the target
	 *
	 *
	 * and if we align 'tc-tc' we get
	 *
	 *       source     target
	 *       __________________
	 *
	 *                 ________
	 *                | |    | |
	 *                | |____| |
	 *                |________|
	 *
	 *  Since the source was moved to have the top-center point to be the same with target top-center
	 *
	 *
	 *
	 * @return {RegionClass} The Region class
	 */
	Region.align = function(sourceRegion, targetRegion, align){

	    targetRegion = Region.from(targetRegion)

	    align = (align || 'c-c').split('-')

	    //<debug>
	    if (align.length != 2){
	        console.warn('Incorrect region alignment! The align parameter need to be in the form \'br-c\', that is, a - separated string!', align)
	    }
	    //</debug>

	    return Region.alignToPoint(sourceRegion, targetRegion.getPoint(align[1]), align[0])
	}

	/**
	 * Modifies the given region to be aligned to the point, as specified by anchor
	 *
	 * @param {Region} region The region to align to the point
	 * @param {Object} point The point to be used as a reference
	 * @param {Number} point.x
	 * @param {Number} point.y
	 * @param {String} anchor The position where to anchor the region to the point. See {@link #getPoint} for available options/
	 *
	 * @return {Region} the given region
	 */
	Region.alignToPoint = function(region, point, anchor){

	    region = Region.from(region)

	    var sourcePoint = region.getPoint(anchor)
	    var count       = 0
	    var shiftObj    = {}

	    if (
	            sourcePoint.x != null &&
	            point.x != null
	        ){

	            count++
	            shiftObj.left = point.x - sourcePoint.x
	    }

	    if (
	            sourcePoint.y != null &&
	            point.y != null
	        ){
	            count++
	            shiftObj.top = point.y - sourcePoint.y
	    }

	    if (count){

	        region.shift(shiftObj)

	    }

	    return region
	}

/***/ },
/* 89 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var Region = __webpack_require__(10)

	/**
	 *
	 * Aligns this region to the given region
	 * @param {Region} region
	 * @param {String} alignPositions For available positions, see {@link #getPoint}
	 *
	 *     eg: 'tr-bl'
	 *
	 * @return this
	 */
	Region.prototype.alignToRegion = function(region, alignPositions){
	    Region.align(this, region, alignPositions)

	    return this
	}

	/**
	 * Aligns this region to the given point, in the anchor position
	 * @param {Object} point eg: {x: 20, y: 600}
	 * @param {Number} point.x
	 * @param {Number} point.y
	 *
	 * @param {String} anchor For available positions, see {@link #getPoint}
	 *
	 *     eg: 'bl'
	 *
	 * @return this
	 */
	 Region.prototype.alignToPoint = function(point, anchor){
	    Region.alignToPoint(this, point, anchor)

	    return this
	}

/***/ },
/* 90 */
/***/ function(module, exports, __webpack_require__) {

	'use strict'

	var ALIGN_TO_NORMALIZED = __webpack_require__(91)

	var Region = __webpack_require__(10)

	/**
	 * @localdoc Given source and target regions, and the given alignments required, returns a region that is the resulting allignment.
	 * Does not modify the sourceRegion.
	 *
	 * Example
	 *
	 *      var sourceRegion = zippy.getInstance({
	 *          alias  : 'z.region',
	 *          top    : 10,
	 *          left   : 10,
	 *          bottom : 40,
	 *          right  : 100
	 *      })
	 *
	 *      var targetRegion = zippy.getInstance({
	 *          alias  : 'z.region',
	 *          top    : 10,
	 *          left   : 10,
	 *          bottom : 40,
	 *          right  : 100
	 *      })
	 *      //has top-left at (10,10)
	 *      //and bottom-right at (40, 100)
	 *
	 *      var alignRegion = alignable.COMPUTE_ALIGN_REGION(sourceRegion, targetRegion, 'tl-br')
	 *
	 *      //alignRegion will be a clone of sourceRegion, but will have the
	 *      //top-left corner aligned with bottom-right of targetRegion
	 *
	 *      alignRegion.get() // => { top: 40, left: 100, bottom: 70, right: 190 }
	 *
	 * @param  {Region} sourceRegion The source region to align to targetRegion
	 * @param  {Region} targetRegion The target region to which to align the sourceRegion
	 * @param  {String/String[]} positions    A string ( delimited by "-" characters ) or an array of strings with the position to try, in the order of their priority.
	 * See Region#getPoint for a list of available positions. They can be combined in any way.
	 * @param  {Object} config      A config object with other configuration for the alignment
	 * @param  {Object/Object[]} config.offset      Optional offsets. Either an object or an array with a different offset for each position
	 * @param  {Element/Region/Boolean} config.constrain  The constrain to region or element. If the boolean true, Region.getDocRegion() will be used
	 * @param  {Object/Boolean} config.sync   A boolean object that indicates whether to sync sourceRegion and targetRegion sizes (width/height or both). Can be
	 *
	 *  * true - in order to sync both width and height
	 *  * { width: true }  - to only sync width
	 *  * { height: true } - to only sync height
	 *  * { size: true }   - to sync both width and height
	 *
	 * @return {Object} an object with the following keys:
	 *
	 *  * position - the position where the alignment was made. One of the given positions
	 *  * region   - the region where the alignment is in place
	 *  * positionChanged - boolean value indicating if the position of the returned region is different from the position of sourceRegion
	 *  * widthChanged    - boolean value indicating if the width of the returned region is different from the width of sourceRegion
	 *  * heightChanged   - boolean value indicating if the height of the returned region is different from the height of sourceRegion
	 */
	function COMPUTE_ALIGN_REGION(sourceRegion, targetRegion, positions, config){
	    sourceRegion = Region.from(sourceRegion)

	    var sourceClone = sourceRegion.clone()
	    var position    = ALIGN_TO_NORMALIZED(sourceClone, targetRegion, positions, config)

	    return {
	        position        : position,
	        region          : sourceClone,
	        widthChanged    : sourceClone.getWidth() != sourceRegion.getWidth(),
	        heightChanged   : sourceClone.getHeight() != sourceRegion.getHeight(),
	        positionChanged : sourceClone.equalsPosition(sourceRegion)
	    }
	}


	module.exports = COMPUTE_ALIGN_REGION

/***/ },
/* 91 */
/***/ function(module, exports, __webpack_require__) {

	'use strict'

	var Region = __webpack_require__(10)

	/**
	 *
	 * This method is trying to align the sourceRegion to the targetRegion, given the alignment positions
	 * and the offsets. It only modifies the sourceRegion
	 *
	 * This is all well and easy, but if there is a constrainTo region, the algorithm has to take it into account.
	 * In this case, it works as follows.
	 *
	 *  * start with the first alignment position. Aligns the region, adds the offset and then check for the constraint.
	 *  * if the constraint condition is ok, return the position.
	 *  * otherwise, remember the intersection area, if the regions are intersecting.
	 *  * then go to the next specified align position, and so on, computing the maximum intersection area.
	 *
	 * If no alignment fits the constrainRegion, the sourceRegion will be resized to match it,
	 * using the position with the maximum intersection area.
	 *
	 * Since we have computed the index of the position with the max intersection area, take that position,
	 * and align the sourceRegion accordingly. Then resize the sourceRegion to the intersection, and reposition
	 * it again, since resizing it might have destroyed the alignment.
	 *
	 * Return the position.
	 *
	 * @param {Region} sourceRegion
	 * @param {Region} targetRegion
	 * @param {String[]} positions
	 * @param {Object} config
	 * @param {Array} config.offset
	 * @param {Region} config.constrain
	 * @param {Boolean/Object} config.sync
	 *
	 * @return {String/Undefined} the chosen position for the alignment, or undefined if no position found
	 */
	function ALIGN_TO_NORMALIZED(sourceRegion, targetRegion, positions, config){

	    targetRegion = Region.from(targetRegion)

	    config = config  || {}

	    var constrainTo = config.constrain,
	        syncOption  = config.sync,
	        offsets     = config.offset || [],
	        syncWidth   = false,
	        syncHeight  = false,
	        sourceClone = sourceRegion.clone()

	    /*
	     * Prepare the method arguments: positions, offsets, constrain and sync options
	     */
	    if (!Array.isArray(positions)){
	        positions = positions? [positions]: []
	    }

	    if (!Array.isArray(offsets)){
	        offsets = offsets? [offsets]: []
	    }

	    if (constrainTo){
	        constrainTo = constrainTo === true?
	                                Region.getDocRegion():
	                                constrainTo.getRegion()
	    }

	    if (syncOption){

	        if (syncOption.size){
	            syncWidth  = true
	            syncHeight = true
	        } else {
	            syncWidth  = syncOption === true?
	                            true:
	                            syncOption.width || false

	            syncHeight = syncOption === true?
	                            true:
	                            syncOption.height || false
	        }
	    }

	    if (syncWidth){
	        sourceClone.setWidth(targetRegion.getWidth())
	    }
	    if (syncHeight){
	        sourceClone.setHeight(targetRegion.getHeight())

	    }

	    var offset,
	        i = 0,
	        len = positions.length,
	        pos,
	        intersection,
	        itArea,
	        maxArea = -1,
	        maxAreaIndex = -1

	    for (; i < len; i++){
	        pos     = positions[i]
	        offset  = offsets[i]

	        sourceClone.alignToRegion(targetRegion, pos)

	        if (offset){
	            if (!Array.isArray(offset)){
	                offset = offsets[i] = [offset.x || offset.left, offset.y || offset.top]
	            }

	            sourceClone.shift({
	                left: offset[0],
	                top : offset[1]
	            })
	        }

	        //the source region is already aligned in the correct position

	        if (constrainTo){
	            //if we have a constrain region, test for the constrain
	            intersection = sourceClone.getIntersection(constrainTo)

	            if ( intersection && intersection.equals(sourceClone) ) {
	                //constrain respected, so return (the aligned position)

	                sourceRegion.set(sourceClone)
	                return pos
	            } else {

	                //the constrain was not respected, so continue trying
	                if (intersection && ((itArea = intersection.getArea()) > maxArea)){
	                    maxArea      = itArea
	                    maxAreaIndex = i
	                }
	            }

	        } else {
	            sourceRegion.set(sourceClone)
	            return pos
	        }
	    }

	    //no alignment respected the constraints
	    if (~maxAreaIndex){
	        pos     = positions[maxAreaIndex]
	        offset  = offsets[maxAreaIndex]

	        sourceClone.alignToRegion(targetRegion, pos)

	        if (offset){
	            sourceClone.shift({
	                left: offset[0],
	                top : offset[1]
	            })
	        }

	        //we are sure an intersection exists, because of the way the maxAreaIndex was computed
	        intersection = sourceClone.getIntersection(constrainTo)

	        sourceClone.setRegion(intersection)
	        sourceClone.alignToRegion(targetRegion, pos)

	        if (offset){
	            sourceClone.shift({
	                left: offset[0],
	                top : offset[1]
	            })
	        }

	        sourceRegion.set(sourceClone)

	        return pos
	    }

	}

	module.exports = ALIGN_TO_NORMALIZED

/***/ },
/* 92 */
/***/ function(module, exports) {

	/* WEBPACK VAR INJECTION */(function(global) {module.exports = 'ontouchstart' in global || (global.DocumentTouch && document instanceof DocumentTouch)
	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ },
/* 93 */
/***/ function(module, exports) {

	'use once'

	module.exports = function once(fn, scope){

	    var called
	    var result

	    return function(){
	        if (called){
	            return result
	        }

	        called = true

	        return result = fn.apply(scope || this, arguments)
	    }
	}

/***/ },
/* 94 */
/***/ function(module, exports) {

	/* WEBPACK VAR INJECTION */(function(global) {module.exports = 'ontouchstart' in global || (global.DocumentTouch && document instanceof DocumentTouch)
	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ },
/* 95 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

	var React = __webpack_require__(6);
	var Region = __webpack_require__(10);
	var ReactMenu = React.createFactory(__webpack_require__(96));
	var assign = __webpack_require__(7);
	var clone = __webpack_require__(125);
	var asArray = __webpack_require__(130);
	var findIndexBy = __webpack_require__(131);
	var findIndexByName = __webpack_require__(132);
	var Cell = __webpack_require__(133);
	var setupColumnDrag = __webpack_require__(134);
	var setupColumnResize = __webpack_require__(135);

	var normalize = __webpack_require__(21);

	function emptyFn() {}

	function getColumnSortInfo(column, sortInfo) {

	    sortInfo = asArray(sortInfo);

	    var index = findIndexBy(sortInfo, function (info) {
	        return info.name === column.name;
	    });

	    return sortInfo[index];
	}

	function removeColumnSort(column, sortInfo) {
	    sortInfo = asArray(sortInfo);

	    var index = findIndexBy(sortInfo, function (info) {
	        return info.name === column.name;
	    });

	    if (~index) {
	        sortInfo.splice(index, 1);
	    }

	    return sortInfo;
	}

	function getDropState() {
	    return {
	        dragLeft: null,
	        dragColumn: null,
	        dragColumnIndex: null,
	        dragging: false,
	        dropIndex: null,

	        shiftIndexes: null,
	        shiftSize: null
	    };
	}

	module.exports = React.createClass({

	    displayName: 'ReactDataGrid.Header',

	    propTypes: {
	        columns: React.PropTypes.array
	    },

	    onDrop: function onDrop(event) {
	        var state = this.state;
	        var props = this.props;

	        if (state.dragging) {
	            event.stopPropagation();
	        }

	        var dragIndex = state.dragColumnIndex;
	        var dropIndex = state.dropIndex;

	        if (dropIndex != null) {

	            //since we need the indexes in the array of all columns
	            //not only in the array of the visible columns
	            //we need to search them and make this transform
	            var dragColumn = props.columns[dragIndex];
	            var dropColumn = props.columns[dropIndex];

	            dragIndex = findIndexByName(props.allColumns, dragColumn.name);
	            dropIndex = findIndexByName(props.allColumns, dropColumn.name);

	            this.props.onDropColumn(dragIndex, dropIndex);
	        }

	        this.setState(getDropState());
	    },

	    getDefaultProps: function getDefaultProps() {
	        return {
	            defaultClassName: 'z-header-wrapper',
	            draggingClassName: 'z-dragging',
	            cellClassName: 'z-column-header',
	            defaultStyle: {},
	            sortInfo: null,
	            scrollLeft: 0,
	            scrollTop: 0
	        };
	    },

	    getInitialState: function getInitialState() {

	        return {
	            mouseOver: true,
	            dragging: false,

	            shiftSize: null,
	            dragColumn: null,
	            shiftIndexes: null
	        };
	    },

	    render: function render() {
	        var props = this.prepareProps(this.props);
	        var state = this.state;

	        var cellMap = {};
	        var cells = props.columns.map(function (col, index) {
	            var cell = this.renderCell(props, state, col, index);
	            cellMap[col.name] = cell;

	            return cell;
	        }, this);

	        if (props.columnGroups && props.columnGroups.length) {
	            cells = props.columnGroups.map(function (colGroup) {
	                var cellProps = {};
	                var columns = [];

	                var cells = colGroup.columns.map(function (colName) {
	                    var col = props.columnMap[colName];
	                    columns.push(col);
	                    return cellMap[colName];
	                });

	                return React.createElement(
	                    Cell,
	                    cellProps,
	                    cells
	                );
	            }, this);
	        }

	        var style = normalize(props.style);
	        var headerStyle = normalize({
	            paddingRight: props.scrollbarSize,
	            transform: 'translate3d(' + -props.scrollLeft + 'px, ' + -props.scrollTop + 'px, 0px)'
	        });

	        return React.createElement(
	            'div',
	            { style: style, className: props.className },
	            React.createElement(
	                'div',
	                { className: 'z-header', style: headerStyle },
	                cells
	            )
	        );
	    },

	    renderCell: function renderCell(props, state, column, index) {

	        var resizing = props.resizing;
	        var text = column.title;
	        var className = props.cellClassName || '';
	        var style = {
	            left: 0
	        };

	        var menu = this.renderColumnMenu(props, state, column, index);

	        if (state.dragColumn && state.shiftIndexes && state.shiftIndexes[index]) {
	            style.left = state.shiftSize;
	        }

	        if (state.dragColumn === column) {
	            className += ' z-drag z-over';
	            style.zIndex = 1;
	            style.left = state.dragLeft || 0;
	        }

	        var filterIcon = props.filterIcon || React.createElement(
	            'svg',
	            { version: '1.1', style: { transform: 'translate3d(0,0,0)', height: '100%', width: '100%', padding: '0px 2px' }, viewBox: '0 0 3 4' },
	            React.createElement('polygon', { points: '0,0 1,2 1,4 2,4 2,2 3,0 ', style: { fill: props.filterIconColor, strokeWidth: 0, fillRule: 'nonZero' } })
	        );

	        var filter = column.filterable ? React.createElement(
	            'div',
	            { className: 'z-show-filter', onMouseUp: this.handleFilterMouseUp.bind(this, column) },
	            filterIcon
	        ) : null;

	        var resizer = column.resizable ? React.createElement('span', { className: 'z-column-resize', onMouseDown: this.handleResizeMouseDown.bind(this, column) }) : null;

	        if (column.sortable) {
	            text = React.createElement(
	                'span',
	                null,
	                text,
	                React.createElement('span', { className: 'z-icon-sort-info' })
	            );

	            var sortInfo = getColumnSortInfo(column, props.sortInfo);

	            if (sortInfo && sortInfo.dir) {
	                className += sortInfo.dir === -1 || sortInfo.dir === 'desc' ? ' z-desc' : ' z-asc';
	            }

	            className += ' z-sortable';
	        }

	        if (filter) {
	            className += ' z-filterable';
	        }

	        if (state.mouseOver === column.name && !resizing) {
	            className += ' z-over';
	        }

	        if (props.menuColumn === column.name) {
	            className += ' z-active';
	        }

	        className += ' z-unselectable';

	        var events = {};

	        events.onMouseDown = this.handleMouseDown.bind(this, column);
	        events.onMouseUp = this.handleMouseUp.bind(this, column);

	        return React.createElement(
	            Cell,
	            _extends({
	                key: column.name,
	                contentPadding: props.cellPadding,
	                columns: props.columns || [],
	                index: index,
	                column: props.columns[index],
	                className: className,
	                style: style,
	                text: text,
	                renderText: column.renderText,
	                header: true,
	                onMouseOut: this.handleMouseOut.bind(this, column),
	                onMouseOver: this.handleMouseOver.bind(this, column)
	            }, events),
	            filter,
	            menu,
	            resizer
	        );
	    },

	    toggleSort: function toggleSort(column) {
	        var sortInfo = asArray(clone(this.props.sortInfo));
	        var columnSortInfo = getColumnSortInfo(column, sortInfo);

	        if (!columnSortInfo) {
	            columnSortInfo = {
	                name: column.name,
	                type: column.type,
	                fn: column.sortFn
	            };

	            sortInfo.push(columnSortInfo);
	        }

	        if (typeof column.toggleSort === 'function') {
	            column.toggleSort(columnSortInfo, sortInfo);
	        } else {

	            var dir = columnSortInfo.dir;
	            var dirSign = dir === 'asc' ? 1 : dir === 'desc' ? -1 : dir;
	            var newDir = dirSign === 1 ? -1 : dirSign === -1 ? 0 : 1;

	            columnSortInfo.dir = newDir;

	            if (!newDir) {
	                sortInfo = removeColumnSort(column, sortInfo);
	            }
	        }

	        ;(this.props.onSortChange || emptyFn)(sortInfo);
	    },

	    renderColumnMenu: function renderColumnMenu(props, state, column, index) {
	        if (!props.withColumnMenu) {
	            return;
	        }

	        var menuIcon = props.menuIcon || React.createElement(
	            'svg',
	            { version: '1.1', style: { transform: 'translate3d(0,0,0)', height: '100%', width: '100%', padding: '0px 2px' }, viewBox: '0 0 3 4' },
	            React.createElement('polygon', { points: '0,0 1.5,3 3,0 ', style: { fill: props.menuIconColor, strokeWidth: 0, fillRule: 'nonZero' } })
	        );

	        return React.createElement(
	            'div',
	            { className: 'z-show-menu', onMouseUp: this.handleShowMenuMouseUp.bind(this, props, column, index) },
	            menuIcon
	        );
	    },

	    handleShowMenuMouseUp: function handleShowMenuMouseUp(props, column, index, event) {
	        event.nativeEvent.stopSort = true;

	        this.showMenu(column, event);
	    },

	    showMenu: function showMenu(column, event) {

	        var menuItem = (function (column) {
	            var visibility = this.props.columnVisibility;

	            var visible = column.visible;

	            if (column.name in visibility) {
	                visible = visibility[column.name];
	            }

	            return {
	                cls: visible ? 'z-selected' : '',
	                selected: visible ? React.createElement(
	                    'span',
	                    { style: { fontSize: '0.95em' } },
	                    '✓'
	                ) : '',
	                label: column.title,
	                fn: this.toggleColumn.bind(this, column)
	            };
	        }).bind(this);

	        function menu(eventTarget, props) {

	            var columns = props.gridColumns;

	            props.columns = ['selected', 'label'];
	            props.items = columns.map(menuItem);
	            props.alignTo = eventTarget;
	            props.alignPositions = ['tl-bl', 'tr-br', 'bl-tl', 'br-tr'];
	            props.style = {
	                position: 'absolute'
	            };

	            var factory = this.props.columnMenuFactory || ReactMenu;

	            var result = factory(props);

	            return result === undefined ? ReactMenu(props) : result;
	        }

	        this.props.showMenu(menu.bind(this, event.currentTarget), {
	            menuColumn: column.name
	        });
	    },

	    showFilterMenu: function showFilterMenu(column, event) {

	        function menu(eventTarget, props) {

	            var defaultFactory = this.props.filterMenuFactory;
	            var factory = column.filterMenuFactory || defaultFactory;

	            props.columns = ['component'];
	            props.column = column;
	            props.alignTo = eventTarget;
	            props.alignPositions = ['tl-bl', 'tr-br', 'bl-tl', 'br-tr'];
	            props.style = {
	                position: 'absolute'
	            };

	            var result = factory(props);

	            return result === undefined ? defaultFactory(props) : result;
	        }

	        this.props.showMenu(menu.bind(this, event.currentTarget), {
	            menuColumn: column.name
	        });
	    },

	    toggleColumn: function toggleColumn(column) {
	        this.props.toggleColumn(column);
	    },

	    hideMenu: function hideMenu() {
	        this.props.showColumnMenu(null, null);
	    },

	    handleResizeMouseDown: function handleResizeMouseDown(column, event) {
	        setupColumnResize(this, this.props, column, event);

	        //in order to prevent setupColumnDrag in handleMouseDown
	        // event.stopPropagation()

	        //we are doing setupColumnDrag protection using the resizing flag on native event
	        if (event.nativeEvent) {
	            event.nativeEvent.resizing = true;
	        }
	    },

	    handleFilterMouseUp: function handleFilterMouseUp(column, event) {
	        event.nativeEvent.stopSort = true;

	        this.showFilterMenu(column, event);
	        // event.stopPropagation()
	    },

	    handleMouseUp: function handleMouseUp(column, event) {
	        if (this.state.dragging) {
	            return;
	        }

	        if (this.state.resizing) {
	            return;
	        }

	        if (event && event.nativeEvent && event.nativeEvent.stopSort) {
	            return;
	        }

	        if (column.sortable) {
	            this.toggleSort(column);
	        }
	    },

	    handleMouseOut: function handleMouseOut(column) {
	        this.setState({
	            mouseOver: false
	        });
	    },

	    handleMouseOver: function handleMouseOver(column) {
	        this.setState({
	            mouseOver: column.name
	        });
	    },

	    handleMouseDown: function handleMouseDown(column, event) {
	        if (event && event.nativeEvent && event.nativeEvent.resizing) {
	            return;
	        }

	        if (!this.props.reorderColumns) {
	            return;
	        }

	        setupColumnDrag(this, this.props, column, event);
	    },

	    onResizeDragStart: function onResizeDragStart(config) {
	        this.setState({
	            resizing: true
	        });
	        this.props.onColumnResizeDragStart(config);
	    },

	    onResizeDrag: function onResizeDrag(config) {
	        this.props.onColumnResizeDrag(config);
	    },

	    onResizeDrop: function onResizeDrop(config, resizeInfo, event) {
	        this.setState({
	            resizing: false
	        });

	        this.props.onColumnResizeDrop(config, resizeInfo);
	    },

	    prepareProps: function prepareProps(thisProps) {
	        var props = {};

	        assign(props, thisProps);

	        this.prepareClassName(props);
	        this.prepareStyle(props);

	        var columnMap = {};(props.columns || []).forEach(function (col) {
	            columnMap[col.name] = col;
	        });

	        props.columnMap = columnMap;

	        return props;
	    },

	    prepareClassName: function prepareClassName(props) {
	        props.className = props.className || '';
	        props.className += ' ' + props.defaultClassName;

	        if (this.state.dragging) {
	            props.className += ' ' + props.draggingClassName;
	        }
	    },

	    prepareStyle: function prepareStyle(props) {
	        var style = props.style = {};

	        assign(style, props.defaultStyle);
	    }
	});

/***/ },
/* 96 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var MenuClass = __webpack_require__(97)

	var MenuItem      = __webpack_require__(115)
	var MenuItemCell  = __webpack_require__(111)
	var MenuSeparator = __webpack_require__(118)

	MenuClass.Item      = MenuItem
	MenuClass.Item.Cell = MenuItemCell
	MenuClass.ItemCell  = MenuItemCell
	MenuClass.Separator = MenuSeparator

	module.exports = MenuClass

/***/ },
/* 97 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	function emptyFn(){}

	var React      = __webpack_require__(6)
	var assign     = __webpack_require__(7)
	var Region     = __webpack_require__(87)
	var inTriangle = __webpack_require__(98)
	var hasTouch = __webpack_require__(99)

	var normalize = __webpack_require__(21)

	var getMenuOffset = __webpack_require__(100)
	var getConstrainRegion = __webpack_require__(104)
	var getItemStyleProps = __webpack_require__(105)
	var renderSubMenu     = __webpack_require__(106)
	var renderChildren    = __webpack_require__(110)
	var prepareItem       = __webpack_require__(112)

	var propTypes = __webpack_require__(119)
	var ScrollContainer = __webpack_require__(120)

	var MenuItem = __webpack_require__(115)

	var MenuClass = React.createClass({

	    displayName: 'Menu',

	    propTypes: propTypes,

	    getDefaultProps: function(){

	        return {
	            isMenu: true,
	            constrainTo: true,
	            enableScroll: true,
	            interactionStyles: true,
	            applyDefaultTheme: true,

	            defaultStyle: {
	                display  : 'inline-block',
	                boxSizing: 'border-box',
	                position : 'relative',

	                background: 'white',
	                //theme props
	                border: '1px solid rgb(46, 153, 235)'
	            },
	            defaultSubMenuStyle: {
	                position: 'absolute'
	            },
	            subMenuStyle: null,


	            scrollerProps: {},

	            columns: ['label'],
	            items  : null,
	            visible: true,

	            defaultItemStyle: {},
	            itemStyle: {},

	            defaultItemOverStyle: {},
	            itemOverStyle: {},

	            defaultItemDisabledStyle: {},
	            itemDisabledStyle: {},

	            defaultItemExpandedStyle: {},
	            itemExpandedStyle: {},

	            defaultCellStyle: {},
	            cellStyle: {},

	            stopClickPropagation: true
	        }
	    },

	    getInitialState: function() {
	        return {
	            mouseOver: false
	        }
	    },

	    componentWillUnmount: function(){
	        this.didMount = false
	    },

	    componentDidMount: function() {
	        ;(this.props.onMount || emptyFn)(this)

	        this.didMount = true

	        if ((this.props.constrainTo || this.props.alignTo) && !this.props.subMenu){
	            setTimeout(function(){

	                if (!this.isMounted()){
	                    return
	                }

	                var props = this.props

	                var scrollRegion = Region.from(this.refs.scrollContainer.getDOMNode())
	                var domNode      = this.getDOMNode()
	                var domRegion    = Region.from(domNode)
	                var paddingSize  = domRegion.height

	                var actualHeight = scrollRegion.height + paddingSize
	                //get clientHeight of this dom node, so as to account for padding

	                //build the actual region of the menu
	                var actualRegion = Region({
	                    left  : domRegion.left,
	                    right : domRegion.right,

	                    top   : domRegion.top,
	                    bottom: domRegion.top + actualHeight
	                })

	                var constrainRegion = props.constrainTo?
	                                        getConstrainRegion(props.constrainTo):
	                                        null

	                var newState

	                if (props.alignTo){
	                    var parentRegion = Region.from(domNode.parentNode)
	                    var alignRegion = Region.from(props.alignTo)

	                    actualRegion.alignTo(alignRegion, props.alignPositions, {
	                        offset: props.alignOffset,
	                        constrain: constrainRegion
	                    })

	                    var newTop = actualRegion.top - parentRegion.top
	                    var newLeft = actualRegion.left - parentRegion.left

	                    newState = {
	                        style: {
	                            left: newLeft,
	                            top : newTop
	                        }
	                    }
	                }

	                if (constrainRegion){
	                    newState = newState || {}

	                    if (actualRegion.bottom > constrainRegion.bottom){
	                        newState.maxHeight = constrainRegion.bottom - actualRegion.top - paddingSize
	                    }
	                }

	                newState && this.setState(newState)
	            }.bind(this), 0)
	        }
	    },

	    prepareProps: function(thisProps, state) {
	        var props = {}

	        assign(props, this.props)

	        props.style     = this.prepareStyle(props, state)
	        props.className = this.prepareClassName(props)

	        props.itemStyleProps = getItemStyleProps(props, state)
	        props.children  = this.prepareChildren(props, state)

	        props.scrollerProps = this.prepareScrollerProps(props)

	        return props
	    },

	    prepareScrollerProps: function(props) {
	        return assign({}, props.scrollerProps)
	    },

	    prepareChildren: function(props, state){

	        var children = props.children

	        if (props.items && props.items.length){
	            children = props.items.map(this.prepareItem.bind(this, props, state))
	        }

	        return children
	    },

	    prepareItem: prepareItem,

	    prepareClassName: function(props) {
	        var className = props.className || ''

	        className += ' z-menu'

	        return className
	    },

	    prepareStyle: function(props, state) {
	        var subMenuStyle = props.subMenu?
	                            props.defaultSubMenuStyle:
	                            null

	        var style = assign({}, props.defaultStyle, subMenuStyle, props.style, props.subMenuStyle)

	        if (!props.visible || (props.items && !props.items.length)){
	            style.display = 'none'
	        }

	        if (props.absolute){
	            style.position = 'absolute'
	        }

	        if (props.at){
	            var isArray = Array.isArray(props.at)
	            var coords = {
	                left: isArray?
	                        props.at[0]:
	                        props.at.left === undefined?
	                            props.at.x || props.at.pageX:
	                            props.at.left,

	                top: isArray?
	                        props.at[1]:
	                        props.at.top === undefined?
	                            props.at.y || props.at.pageY:
	                            props.at.top
	            }

	            assign(style, coords)
	        }

	        if (state.style){
	            assign(style, state.style)
	        }

	        if (!this.didMount && (props.constrainTo || props.alignTo) && !props.subMenu){
	            //when a top menu is initially rendered (and should be constrained or has alignTo)
	            //we show it hidden initially, so we can safely constrain and/or align it
	            style.visibility = 'hidden'
	            style.maxHeight  = 0
	            style.overflow   = 'hidden'
	        }

	        return normalize(style)
	    },

	    /////////////// RENDERING LOGIC

	    renderSubMenu: renderSubMenu,

	    render: function() {
	        var state = this.state
	        var props = this.prepareProps(this.props, state)

	        var menu     = this.renderSubMenu(props, state)
	        var children = this.renderChildren(props, state)

	        return (
	            React.createElement("div", React.__spread({},  props), 
	                menu, 
	                React.createElement(ScrollContainer, {
	                    onMouseEnter: this.handleMouseEnter, 
	                    onMouseLeave: this.handleMouseLeave, 
	                    scrollerProps: props.scrollerProps, 
	                    ref: "scrollContainer", enableScroll: props.enableScroll, maxHeight: state.maxHeight || props.maxHeight}, 
	                    React.createElement("table", {ref: "table", style: {borderSpacing: 0}}, 
	                        React.createElement("tbody", null, 
	                            children
	                        )
	                    )
	                )
	            )
	        )
	    },

	    renderChildren: renderChildren,

	    ////////////////////////// BEHAVIOUR LOGIC

	    handleMouseEnter: function() {
	        this.setState({
	            mouseInside: true
	        })

	        this.onActivate()
	    },

	    handleMouseLeave: function() {
	        this.setState({
	            mouseInside: false
	        })

	        if (!this.state.menu && !this.state.nextItem){
	        // if (!this.state.nextItem){
	            this.onInactivate()
	        }
	    },

	    onActivate: function() {
	        if (!this.state.activated){
	            // console.log('activate')
	            this.setState({
	                activated: true
	            })

	            ;(this.props.onActivate || emptyFn)()
	        }
	    },

	    onInactivate: function() {
	        if (this.state.activated){

	            this.setState({
	                activated: false
	            })

	            // console.log('inactivate')
	            ;(this.props.onInactivate || emptyFn)()
	        }
	    },

	    //we also need mouseOverSubMenu: Boolean
	    //since when from a submenu we move back to a parent menu, we may move
	    //to a different menu item than the one that triggered the submenu
	    //so we should display another submenu
	    handleSubMenuMouseEnter: function() {
	        this.setState({
	            mouseOverSubMenu: true
	        })
	    },

	    handleSubMenuMouseLeave: function() {
	        this.setState({
	            mouseOverSubMenu: false
	        })
	    },

	    isSubMenuActive: function() {
	        return this.state.subMenuActive
	    },

	    onSubMenuActivate: function() {
	        this.setState({
	            subMenuActive: true
	        })
	    },

	    onSubMenuInactivate: function() {
	        var ts = +new Date()

	        var nextItem      = this.state.nextItem
	        var nextTimestamp = this.state.nextTimestamp || 0

	        this.setState({
	            subMenuActive: false,
	            timestamp       : ts
	        }, function(){

	            setTimeout(function(){
	                if (ts != this.state.timestamp || (nextItem && (ts - nextTimestamp < 100))){
	                    //a menu show has occured in the mean-time,
	                    //so skip hiding the menu
	                    this.setItem(this.state.nextItem, this.state.nextOffset)
	                    return
	                }

	                if (!this.isSubMenuActive()){
	                    this.setItem()
	                }
	            }.bind(this), 10)

	        })

	    },

	    removeMouseMoveListener: function() {
	        if (this.onWindowMouseMove){
	            window.removeEventListener('mousemove', this.onWindowMouseMove)
	            this.onWindowMouseMove = null
	        }
	    },

	    onMenuItemMouseOut: function(itemProps, leaveOffset) {
	        if (this.state.menu){
	            this.setupCheck(leaveOffset)
	        }
	    },

	    /**
	     * Called when mouseout happens on the item for which there is a submenu displayed
	     */
	    onMenuItemMouseOver: function(itemProps, menuOffset, entryPoint) {

	        if (!this.didMount){
	            return
	        }

	        var menu = itemProps.menu
	        var ts   = +new Date()

	        if (!menu){
	            return
	        }

	        if (!this.state.menu){
	            //there is no menu visible, so it's safe to show the menu
	            this.setItem(itemProps, menuOffset)
	        } else {
	            //there is a menu visible, from the previous item that had mouse over
	            //so we should queue this item's menu as the next menu to be shown
	            this.setNextItem(itemProps, menuOffset)
	        }
	    },

	    setupCheck: function(offset){
	        if (!this.didMount){
	            return
	        }

	        var tolerance = 5

	        var domNode    = this.getDOMNode()
	        var menuNode   = domNode.querySelector('.z-menu')

	        if (!menuNode){
	            return
	        }

	        var menuRegion = Region.from(menuNode)

	        var x1 = menuRegion.left
	        var y1 = menuRegion.top// - tolerance

	        var x2 = menuRegion.left
	        var y2 = menuRegion.bottom// + tolerance

	        if (this.subMenuPosition == 'left'){
	            x1 = menuRegion.right
	            x2 = menuRegion.right
	        }

	        var x3 = offset.x + (this.subMenuPosition == 'left'? tolerance: -tolerance)
	        var y3 = offset.y

	        var triangle = [
	            [x1, y1],
	            [x2, y2],
	            [x3, y3]
	        ]

	        this.removeMouseMoveListener()

	        this.onWindowMouseMove = function(event){

	            var point = [event.pageX, event.pageY]

	            if (!inTriangle(point, triangle)){

	                this.removeMouseMoveListener()

	                if (!this.state.mouseOverSubMenu){
	                    //the mouse is not over a sub menu item
	                    //
	                    //so we show a menu of a sibling item, or hide the menu
	                    //if no sibling item visited
	                    this.setItem(this.state.nextItem, this.state.nextOffset)
	                }
	            }
	        }.bind(this)

	        window.addEventListener('mousemove', this.onWindowMouseMove)
	    },

	    setNextItem: function(itemProps, menuOffset) {

	        var ts = +new Date()

	        this.setState({
	            timestamp        : ts,

	            nextItem     : itemProps,
	            nextOffset   : menuOffset,
	            nextTimestamp: +new Date()
	        })
	    },

	    setItem: function(itemProps, offset) {

	        var menu = itemProps?
	                        itemProps.menu:
	                        null

	        // if (!menu){
	        //     return
	        // }

	        this.removeMouseMoveListener()

	        if (!this.didMount){
	            return
	        }

	        if (!menu && !this.state.mouseInside){
	            this.onInactivate()
	        }

	        this.setState({
	            itemProps    : itemProps,

	            menu         : menu,
	            menuOffset   : offset,
	            timestamp    : +new Date(),

	            nextItem     : null,
	            nextOffset   : null,
	            nextTimestamp: null
	        })
	    },

	    onMenuItemExpanderClick: function(event) {
	        event.nativeEvent.expanderClick = true
	    },

	    onMenuItemClick: function(event, props, index) {

	        var stopped = event.isPropagationStopped()

	        this.props.stopClickPropagation && event.stopPropagation()

	        if (hasTouch && props && event && event.nativeEvent && event.nativeEvent.expanderClick){

	            var offset = {
	                x: event.pageX,
	                y: event.pageY
	            }

	            var menuOffset = getMenuOffset(event.currentTarget)
	            this.onMenuItemMouseOver(props, menuOffset, offset)

	            return
	        }

	        if (!stopped){
	            if (props){
	                ;(this.props.onClick || emptyFn)(event, props, index)
	            }

	            this.onChildClick(event, props)
	        }
	    },

	    onChildClick: function(event, props) {
	        ;(this.props.onChildClick || emptyFn)(event, props)

	        if (this.props.parentMenu){
	            this.props.parentMenu.onChildClick(event, props)
	        }
	    }
	})

	MenuClass.themes = __webpack_require__(124)

	module.exports = MenuClass

/***/ },
/* 98 */
/***/ function(module, exports) {

	//http://www.blackpawn.com/texts/pointinpoly/
	module.exports = function pointInTriangle(point, triangle) {
	    //compute vectors & dot products
	    var cx = point[0], cy = point[1],
	        t0 = triangle[0], t1 = triangle[1], t2 = triangle[2],
	        v0x = t2[0]-t0[0], v0y = t2[1]-t0[1],
	        v1x = t1[0]-t0[0], v1y = t1[1]-t0[1],
	        v2x = cx-t0[0], v2y = cy-t0[1],
	        dot00 = v0x*v0x + v0y*v0y,
	        dot01 = v0x*v1x + v0y*v1y,
	        dot02 = v0x*v2x + v0y*v2y,
	        dot11 = v1x*v1x + v1y*v1y,
	        dot12 = v1x*v2x + v1y*v2y

	    // Compute barycentric coordinates
	    var b = (dot00 * dot11 - dot01 * dot01),
	        inv = b === 0 ? 0 : (1 / b),
	        u = (dot11*dot02 - dot01*dot12) * inv,
	        v = (dot00*dot12 - dot01*dot02) * inv
	    return u>=0 && v>=0 && (u+v < 1)
	}

/***/ },
/* 99 */
/***/ function(module, exports) {

	/* WEBPACK VAR INJECTION */(function(global) {module.exports = 'ontouchstart' in global || (global.DocumentTouch && document instanceof DocumentTouch)
	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ },
/* 100 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var Region       = __webpack_require__(87)
	var selectParent = __webpack_require__(101)

	module.exports = function(domNode){

	    var menuRegion = Region.from(selectParent('.z-menu', domNode))
	    var thisRegion = Region.from(domNode)

	    return {
	        // pageX : thisRegion.left,
	        // pageY : thisRegion.top,

	        left  : thisRegion.left - menuRegion.left,
	        top   : thisRegion.top  - menuRegion.top,
	        width : thisRegion.width,
	        height: thisRegion.height
	    }
	}

/***/ },
/* 101 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var curry   = __webpack_require__(102)
	var matches

	module.exports = curry(function(selector, node){

		matches = matches || __webpack_require__(103)

	    while (node = node.parentElement){
	        if (matches.call(node, selector)){
	            return node
	        }
	    }
	})

/***/ },
/* 102 */
/***/ function(module, exports) {

	'use strict';

	function curry(fn, n){

	    if (typeof n !== 'number'){
	        n = fn.length
	    }

	    function getCurryClosure(prevArgs){

	        function curryClosure() {

	            var len  = arguments.length
	            var args = [].concat(prevArgs)

	            if (len){
	                args.push.apply(args, arguments)
	            }

	            if (args.length < n){
	                return getCurryClosure(args)
	            }

	            return fn.apply(this, args)
	        }

	        return curryClosure
	    }

	    return getCurryClosure([])
	}

	module.exports = curry

/***/ },
/* 103 */
/***/ function(module, exports) {

	'use strict';

	var proto = Element.prototype

	var nativeMatches = proto.matches ||
	  proto.mozMatchesSelector ||
	  proto.msMatchesSelector ||
	  proto.oMatchesSelector ||
	  proto.webkitMatchesSelector

	module.exports = nativeMatches


/***/ },
/* 104 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var Region = __webpack_require__(87)
	var selectParent = __webpack_require__(101)

	module.exports = function(constrainTo){
	    var constrainRegion

	    if (constrainTo === true){
	        constrainRegion = Region.getDocRegion()
	    }

	    if (!constrainRegion && typeof constrainTo === 'string'){
	        var parent = selectParent(constrainTo, this.getDOMNode())
	        constrainRegion = Region.from(parent)
	    }

	    if (!constrainRegion && typeof constrainTo === 'function'){
	        constrainRegion = Region.from(constrainTo())
	    }

	    return constrainRegion
	}

/***/ },
/* 105 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var assign = __webpack_require__(7)

	module.exports = function(props, state){

	    var itemStyle         = assign({}, props.defaultItemStyle, props.itemStyle)
	    var itemOverStyle     = assign({}, props.defaultItemOverStyle, props.itemOverStyle)
	    var itemActiveStyle   = assign({}, props.defaultItemActiveStyle, props.itemActiveStyle)
	    var itemDisabledStyle = assign({}, props.defaultItemDisabledStyle, props.itemDisabledStyle)
	    var itemExpandedStyle = assign({}, props.defaultItemExpandedStyle, props.itemExpandedStyle)
	    var cellStyle     = assign({}, props.defaultCellStyle, props.cellStyle)

	    return {
	        itemStyle        : itemStyle,
	        itemOverStyle    : itemOverStyle,
	        itemActiveStyle  : itemActiveStyle,
	        itemDisabledStyle: itemDisabledStyle,
	        itemExpandedStyle: itemExpandedStyle,
	        cellStyle        : cellStyle
	    }
	}

/***/ },
/* 106 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var Region           = __webpack_require__(87)
	var assign           = __webpack_require__(7)
	var cloneWithProps   = __webpack_require__(107)
	var getPositionStyle = __webpack_require__(108)

	module.exports = function(props, state) {
	    var menu = state.menu

	    if (menu && this.didMount){

	        var style = getPositionStyle.call(this, props, state)

	        menu = cloneWithProps(menu, assign({
	            ref          : 'subMenu',
	            subMenu      : true,
	            parentMenu   : this,
	            maxHeight    : state.subMenuMaxHeight,
	            onActivate   : this.onSubMenuActivate,
	            onInactivate : this.onSubMenuInactivate,
	            scrollerProps: props.scrollerProps,
	            constrainTo  : props.constrainTo,
	            expander     : props.expander,
	            theme        : props.theme,
	            themes       : props.themes || this.constructor.themes
	        }, props.itemStyleProps))

	        return React.createElement("div", {ref: "subMenuWrap", style: style, 
	                onMouseEnter: this.handleSubMenuMouseEnter, 
	                onMouseLeave: this.handleSubMenuMouseLeave
	            }, menu)
	    }
	}

/***/ },
/* 107 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	var React    = __webpack_require__(6)
	  , hasOwn   = Object.prototype.hasOwnProperty
	  , version  = React.version.split('.').map(parseFloat)
	  , RESERVED = {
	      className:  resolve(joinClasses),
	      children:   function(){},
	      key:        function(){},
	      ref:        function(){},
	      style:      resolve(extend)
	    };

	module.exports = function cloneWithProps(child, props) {
	  var newProps = mergeProps(props, child.props);

	  if (!hasOwn.call(newProps, 'children') && hasOwn.call(child.props, 'children'))
	    newProps.children = child.props.children;

	  // < 0.11
	  if (version[0] === 0 && version[1] < 11)
	    return child.constructor.ConvenienceConstructor(newProps);
	  
	  // 0.11
	  if (version[0] === 0 && version[1] === 11)
	    return child.constructor(newProps);

	  // 0.12
	  else if (version[0] === 0 && version[1] === 12){
	    MockLegacyFactory.isReactLegacyFactory = true
	    MockLegacyFactory.type = child.type
	    return React.createElement(MockLegacyFactory, newProps);
	  }

	  // 0.13+
	  return React.createElement(child.type, newProps);

	  function MockLegacyFactory(){}
	}

	function mergeProps(currentProps, childProps) {
	  var newProps = extend(currentProps), key

	  for (key in childProps) {
	    if (hasOwn.call(RESERVED, key) )
	      RESERVED[key](newProps, childProps[key], key)

	    else if ( !hasOwn.call(newProps, key) )
	      newProps[key] = childProps[key];
	  }
	  return newProps
	}

	function resolve(fn){
	  return function(src, value, key){
	    if( !hasOwn.call(src, key)) src[key] = value
	    else src[key] = fn(src[key], value)
	  }
	}

	function joinClasses(a, b){
	  if ( !a ) return b || ''
	  return a + (b ? ' ' + b : '')
	}

	function extend() {
	  var target = {};
	  for (var i = 0; i < arguments.length; i++) 
	    for (var key in arguments[i]) if (hasOwn.call(arguments[i], key)) 
	      target[key] = arguments[i][key]   
	  return target
	}

/***/ },
/* 108 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var Region = __webpack_require__(87)
	var assign = __webpack_require__(7)
	var align  = __webpack_require__(109)

	module.exports = function getPositionStyle(props, state){
	    if (!state.menu || !this.didMount){
	        this.prevMenuIndex = -1
	        return
	    }

	    var offset = state.menuOffset
	    var left   = offset.left + offset.width
	    var top    = offset.top

	    var menuIndex = state.itemProps.index
	    var sameMenu = this.prevMenuIndex == menuIndex

	    if (this.aligning && !sameMenu){
	        this.aligning = false
	    }

	    this.prevMenuIndex = menuIndex

	    var style = {
	        position     : 'absolute',
	        visibility   : 'hidden',
	        overflow     : 'hidden',
	        pointerEvents: 'none',
	        left         : left,
	        top          : top,
	        zIndex       : 1
	    }

	    if (!this.aligning && !sameMenu){
	        setTimeout(function(){

	            if (!this.didMount){
	                return
	            }

	            var thisRegion = Region.from(this.getDOMNode())
	            var menuItemRegion = Region.from({
	                left  : thisRegion.left,
	                top   : thisRegion.top + offset.top,
	                width : offset.width,
	                height: offset.height
	            })

	            var subMenuMounted = this.refs.subMenu && this.refs.subMenu.isMounted()
	            if (!subMenuMounted){
	                return
	            }

	            var subMenuRegion = Region.from(this.refs.subMenu.refs.scrollContainer.getCurrentSizeDOM())

	            var initialHeight = subMenuRegion.height

	            var alignPos = align(props, subMenuRegion, /* alignTo */ menuItemRegion, props.constrainTo)

	            var newHeight = subMenuRegion.height
	            var maxHeight

	            if (newHeight < initialHeight){
	                maxHeight = newHeight - props.subMenuConstrainMargin
	            }

	            if (maxHeight && alignPos == -1 /* upwards*/){
	                subMenuRegion.top = subMenuRegion.bottom - maxHeight
	            }

	            var newLeft = subMenuRegion.left - thisRegion.left
	            var newTop  = subMenuRegion.top  - thisRegion.top

	            if (Math.abs(newLeft - left) < 5){
	                newLeft = left
	            }

	            if (Math.abs(newTop - top) < 5){
	                newTop = top
	            }

	            this.subMenuPosition = newLeft < 0? 'left': 'right'

	            this.alignOffset = {
	                left: newLeft,
	                top : newTop
	            }
	            this.aligning = true

	            this.setState({
	                subMenuMaxHeight: maxHeight
	            })

	        }.bind(this), 0)
	    }

	    if (sameMenu || (this.aligning && this.alignOffset)){
	        assign(style, this.alignOffset)
	        style.visibility = 'visible'
	        delete style.pointerEvents
	        delete style.overflow
	    }

	    this.aligning = false

	    return style
	}

/***/ },
/* 109 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var Region = __webpack_require__(87)
	var getConstrainRegion = __webpack_require__(104)

	module.exports = function(props, subMenuRegion, targetAlignRegion, constrainTo){
	    var constrainRegion = getConstrainRegion.call(this, constrainTo)

	    if (!constrainRegion){
	        return
	    }



	    if (typeof props.alignSubMenu === 'function'){
	        props.alignSubMenu(subMenuRegion, targetAlignRegion, constrainRegion)
	    } else {
	        var pos = subMenuRegion.alignTo(targetAlignRegion, [
	            //align to right
	            'tl-tr','bl-br',

	            //align to left
	            'tr-tl', 'br-bl'
	        ], { constrain: constrainRegion })

	        return (pos == 'tl-tr' || pos == 'tr-tl')?
	                    //align downwards
	                    1:

	                    //align upwards
	                    -1
	    }
	}

/***/ },
/* 110 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var React = __webpack_require__(6)
	var MenuItemCell = __webpack_require__(111)

	var cloneWithProps = __webpack_require__(107)
	var assign         = __webpack_require__(7)

	function emptyFn(){}

	module.exports = function(props, state) {

	    var expandedIndex  = state.itemProps?
	                            state.itemProps.index:
	                            -1

	    var children     = props.children
	    var maxCellCount = 1
	    var menuItems    = []

	    React.Children.map(children, function(item){
	        var itemProps = item.props

	        menuItems.push(item)

	        if (!itemProps || !itemProps.isMenuItem){
	            return
	        }

	        var count = React.Children.count(itemProps.children)

	        maxCellCount = Math.max(maxCellCount, count)
	    })

	    var itemStyleProps = props.itemStyleProps
	    var i = -1
	    var result = menuItems.map(function(item, index){
	        var itemProps = item.props

	        if (itemProps && itemProps.isMenuItem){
	            i++

	            itemProps.onMenuItemMouseOver = this.onMenuItemMouseOver
	            itemProps.onMenuItemMouseOut  = this.onMenuItemMouseOut
	        }

	        var children = React.Children.map(itemProps.children, function(c){ return c })
	        var count    = React.Children.count(children)

	        if (count < maxCellCount){
	            children = children? [children]: []
	        }

	        while (count < maxCellCount){
	            count++
	            children.push(React.createElement(MenuItemCell, null))
	        }

	        var onClick = itemProps.onClick || emptyFn

	        var cloned = cloneWithProps(item, assign({
	            interactionStyles: props.interactionStyles,
	            itemIndex: i,
	            itemCount: menuItems.length,
	            key      : index,
	            index    : index,
	            expanded : expandedIndex == index,
	            children : children,
	            expander : props.expander,
	            applyDefaultTheme: props.applyDefaultTheme,
	            theme    : props.theme,
	            themes   : props.themes || this.constructor.themes,
	            onExpanderClick: this.onMenuItemExpanderClick,
	            onClick  : function(event, props, index){
	                onClick.apply(null, arguments)
	                this.onMenuItemClick(event, props, index)
	            }.bind(this)
	        }, {
	            style        : itemStyleProps.itemStyle,
	            overStyle    : itemStyleProps.itemOverStyle,
	            activeStyle  : itemStyleProps.itemActiveStyle,
	            disabledStyle: itemStyleProps.itemDisabledStyle,
	            expandedStyle: itemStyleProps.itemExpandedStyle,
	            cellStyle    : itemStyleProps.cellStyle
	        }))

	        return cloned

	    }, this)

	    return result
	}

/***/ },
/* 111 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var React  = __webpack_require__(6)
	var assign =__webpack_require__(7)

	var MenuItemCell = React.createClass({

	    displayName: 'ReactMenuItemCell',

	    getDefaultProps: function() {
	        return {
	            defaultStyle: {
	                padding: 5,
	                whiteSpace: 'nowrap'
	            }
	        }
	    },

	    render: function() {
	        var props    = this.prepareProps(this.props)
	        var children = props.children

	        if (props.expander){
	            children = props.expander === true? '›': props.expander
	        }

	        return (
	            React.createElement("td", React.__spread({},  props), 
	                children
	            )
	        )
	    },

	    prepareProps: function(thisProps) {
	        var props = {}

	        assign(props, thisProps)

	        props.style = this.prepareStyle(props)

	        return props
	    },

	    prepareStyle: function(props) {
	        var style = {}

	        assign(style, props.defaultStyle, props.style)

	        // if (props.itemIndex != props.itemCount - 1){
	        //     style.paddingBottom = 0
	        // }

	        return style
	    }
	})

	module.exports = MenuItemCell

/***/ },
/* 112 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var React  = __webpack_require__(6)
	var assign = __webpack_require__(7)

	var renderCells     = __webpack_require__(113)
	var MenuItem        = __webpack_require__(115)
	var MenuItemFactory = React.createFactory(MenuItem)
	var MenuSeparator   = __webpack_require__(118)

	module.exports = function(props, state, item, index) {

	    var expandedIndex = state.itemProps?
	                            state.itemProps.index:
	                            -1

	    if (item === '-'){
	        return React.createElement(MenuSeparator, {key: index})
	    }

	    var className   = [props.itemClassName, item.cls, item.className]
	                        .filter(function(x)  {return !!x;})
	                        .join(' ')

	    var itemProps = assign({
	        className  : className,
	        key        : index,
	        data       : item,
	        columns    : props.columns,
	        expanded   : index === expandedIndex,
	        disabled   : item.disabled,
	        onClick    : item.onClick || item.fn
	    }, props.itemStyleProps)

	    itemProps.children = renderCells(itemProps)

	    if (item.items){
	        var Menu = __webpack_require__(97)
	        itemProps.children.push(React.createElement(Menu, {items: item.items}))
	    }

	    return (props.itemFactory || MenuItemFactory)(itemProps)
	}

/***/ },
/* 113 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var renderCell = __webpack_require__(114)

	module.exports = function(props) {
	    return props.columns.map(renderCell.bind(null, props))
	}

/***/ },
/* 114 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var React        = __webpack_require__(6)
	var assign       = __webpack_require__(7)
	var MenuItemCell = __webpack_require__(111)

	module.exports = function(props, column) {
	    var style = assign({}, props.defaultCellStyle, props.cellStyle)

	    return React.createElement(MenuItemCell, {style: style}, props.data[column])
	}

/***/ },
/* 115 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var React         = __webpack_require__(6)
	var assign        = __webpack_require__(7)
	var normalize     = __webpack_require__(21)
	var EVENT_NAMES   = __webpack_require__(116)

	var getMenuOffset = __webpack_require__(100)

	var prepareChildren = __webpack_require__(117)

	var Menu = __webpack_require__(97)
	var MenuItemCell = __webpack_require__(111)

	var emptyFn = function(){}

	function toUpperFirst(s){
	    return s?
	            s.charAt(0).toUpperCase() + s.substring(1):
	            ''
	}

	var MenuItem = React.createClass({

	    displayName: 'ReactMenuItem',

	    getInitialState: function() {
	        return {}
	    },

	    getDefaultProps: function() {
	        return {
	            isMenuItem: true,
	            interactionStyles: true,

	            defaultStyle: {
	                cursor    : 'pointer',
	                userSelect: 'none',
	                boxSizing : 'border-box'
	            },

	            expander: '›'
	        }
	    },

	    render: function() {
	        var props = this.prepareProps(this.props, this.state)

	        return React.createElement("tr", React.__spread({},  props))
	    },

	    componentDidMount: function() {
	        this.didMount = true
	    },

	    prepareProps: function(thisProps, state) {
	        var props = {}

	        assign(props, thisProps)

	        props.theme = this.prepareTheme(props)

	        props.mouseOver = !!state.mouseOver
	        props.active    = !!state.active
	        props.disabled    = !!props.disabled

	        props.style     = this.prepareStyle(props)
	        props.className = this.prepareClassName(props)

	        props.children  = this.prepareChildren(props)

	        props.onClick      = this.handleClick.bind(this, props)
	        props.onMouseEnter = this.handleMouseEnter.bind(this, props)
	        props.onMouseLeave = this.handleMouseLeave.bind(this, props)
	        props.onMouseDown  = this.handleMouseDown
	        props.onMouseMove  = this.handleMouseMove

	        return props
	    },

	    prepareTheme: function(props){
	        var THEMES = props.themes = props.themes || this.constructor.theme || THEME
	        var theme  = props.theme

	        if (typeof theme == 'string'){
	            theme = THEMES[theme]
	        }

	        return theme || THEMES.default
	    },

	    handleClick: function(props, event) {

	        if (props.disabled){
	            event.stopPropagation()
	            return
	        }

	        ;(this.props.onClick || this.props.fn || emptyFn)(event, props, props.index)
	    },

	    handleMouseMove: function(event){

	    },

	    handleMouseDown: function(event) {

	        var mouseUpListener = function(){
	            this.setState({
	                active: false
	            })
	            window.removeEventListener('mouseup', mouseUpListener)
	        }.bind(this)

	        window.addEventListener('mouseup', mouseUpListener)

	        this.setState({
	            active: true
	        })
	    },

	    showMenu: function(menu, props) {

	        props.showMenu(menu, offset)
	    },

	    handleMouseEnter: function(props, event) {

	        if (props.disabled){
	            return
	        }

	        var offset = {
	            x: event.pageX,
	            y: event.pageY
	        }

	        this.setState({
	            mouseOver: true
	        })

	        if (props.onMenuItemMouseOver){

	            var menuOffset

	            if (props.menu){
	                // console.log(props);
	                menuOffset = getMenuOffset(this.getDOMNode())
	            }

	            // console.log(menuOffset, offset);
	            props.onMenuItemMouseOver(props, menuOffset, offset)
	        }
	    },

	    handleMouseLeave: function(props, event) {

	        if (props.disabled){
	            return
	        }

	        var offset = {
	            x: event.pageX,
	            y: event.pageY
	        }

	        if (this.didMount){
	            this.setState({
	                active: false,
	                mouseOver: false
	            })
	        }

	        if (props.onMenuItemMouseOut){
	            props.onMenuItemMouseOut(props, offset)
	        }
	    },

	    prepareChildren: prepareChildren,

	    prepareClassName: function(props) {
	        var className = props.className || ''

	        className += ' menu-row'

	        if (props.disabled){
	            className += ' disabled ' + (props.disabledClassName || '')
	        } else {

	            if (props.mouseOver){
	                className += ' over ' + (props.overClassName || '')
	            }

	            if (props.active){
	                className += ' active ' + (props.activeClassName || '')
	            }

	            if (props.expanded){
	                className += ' expanded ' + (props.expandedClassName || '')
	            }
	        }

	        return className
	    },

	    prepareDefaultStyle: function(props){
	        var defaultStyle = assign({}, props.defaultStyle)

	        if (props.disabled){
	            assign(defaultStyle, props.defaultDisabledStyle)
	        }

	        return defaultStyle
	    },

	    prepareComputedStyleNames: function(props){
	        var names = ['style']

	        if (props.disabled){
	            names.push('disabledStyle')

	            return names
	        }

	        if (props.expanded){
	            names.push('expandedStyle')
	        }

	        //names is something like ['style','expandedStyle']
	        //
	        //now we add over and active styles

	        var overNames
	        if (props.mouseOver){
	            overNames = names.map(function(name){
	                return 'over' + toUpperFirst(name)
	            })
	        }

	        var activeNames
	        if (props.active){
	            activeNames = names.map(function(name){
	                return 'active' + toUpperFirst(name)
	            })
	        }

	        overNames   && names.push.apply(names, overNames)
	        activeNames && names.push.apply(names, activeNames)

	        return names
	    },

	    prepareStyle: function(props) {
	        var style = assign({}, this.prepareDefaultStyle(props))

	        var styleNames = this.prepareComputedStyleNames(props)
	        var theme      = props.theme
	        var THEMES     = props.themes


	        if (theme){
	            //apply default theme first
	            if (props.applyDefaultTheme && theme != THEMES.default && THEMES.default){
	                styleNames.forEach(function(styleName){
	                    assign(style, THEMES.default[styleName])
	                })
	            }

	            //then apply theme
	            styleNames.forEach(function(styleName){
	                assign(style, theme[styleName])
	            })
	        }

	        ;(props.onThemeStyleReady || emptyFn)(style, props)

	        //now apply non-theme
	        styleNames.forEach(function(styleName){
	            assign(style, props[styleName])
	        })

	        ;(props.onStyleReady || emptyFn)(style, props)

	        return normalize(style)


	        // assign(style, props.defaultStyle, props.style)

	        // if (props.disabled){

	        //     assign(style, props.defaultDisabledStyle, props.disabledStyle)

	        // } else {

	        //     if (props.interactionStyles){
	        //         if (props.expanded){
	        //             assign(style, props.defaultExpandedStyle, props.expandedStyle)
	        //         }

	        //         if (props.mouseOver){
	        //             assign(style, props.defaultOverStyle, props.overStyle)
	        //         }

	        //         if (props.active){
	        //             assign(style, props.defaultActiveStyle, props.activeStyle)
	        //         }
	        //     }
	        // }

	        // return normalize(style)
	    }
	})

	module.exports = MenuItem

/***/ },
/* 116 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	module.exports = __webpack_require__(99)?
		{
			onMouseDown: 'onTouchStart',
			onMouseUp  : 'onTouchEnd',
			onMouseMove: 'onTouchMove'
		}:
		{
			onMouseDown: 'onMouseDown',
			onMouseUp  : 'onMouseUp',
			onMouseMove: 'onMouseMove'
		}

/***/ },
/* 117 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var React        = __webpack_require__(6)
	var Menu         = __webpack_require__(97)
	var MenuItemCell = __webpack_require__(111)
	var renderCell   = __webpack_require__(114)
	var cloneWithProps = __webpack_require__(107)

	module.exports = function(props) {

	    var children = []
	    var menu

	    React.Children.forEach(props.children, function(child){
	        if (child){
	            if (child.props && child.props.isMenu){
	                menu = cloneWithProps(child, {
	                    ref: 'subMenu'
	                })
	                menu.props.subMenu = true
	                return
	            }

	            if (typeof child != 'string'){
	                child = cloneWithProps(child, {
	                    style    : props.cellStyle,
	                    itemIndex: props.itemIndex,
	                    itemCount: props.itemCount
	                })
	            }

	            children.push(child)
	        }
	    })

	    if (menu){
	        props.menu = menu
	        var expander = props.expander || true
	        var expanderProps = {}

	        if (expander){
	            expanderProps.onClick = props.onExpanderClick
	        }
	        children.push(React.createElement(MenuItemCell, React.__spread({expander: expander},  expanderProps)))
	    }

	    return children
	}

/***/ },
/* 118 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var React  = __webpack_require__(6)
	var assign = __webpack_require__(7)

	var emptyFn = function(){}

	var MenuSeparator = React.createClass({

	    displayName: 'ReactMenuSeparator',

	    getDefaultProps: function() {
	        return {
	            size: 1
	        }
	    },

	    render: function() {
	        var props = this.prepareProps(this.props)

	        return React.createElement("tr", React.__spread({},  props), React.createElement("td", {colSpan: 10, style: {padding: 0}}))
	    },

	    prepareProps: function(thisProps) {
	        var props = {}

	        assign(props, thisProps)

	        props.style = this.prepareStyle(props)
	        props.className = this.prepareClassName(props)

	        return props
	    },

	    prepareClassName: function(props) {
	        var className = props.className || ''

	        className += ' menu-separator'

	        return className
	    },

	    prepareStyle: function(props) {
	        var style = {}

	        assign(style,
	            MenuSeparator.defaultStyle,
	            MenuSeparator.style,
	            {
	                height: MenuSeparator.size || props.size
	            },
	            props.style
	        )

	        return style
	    }
	})

	MenuSeparator.defaultStyle = {
	    cursor    : 'auto',
	    background: 'gray'
	}

	MenuSeparator.style = {}

	module.exports = MenuSeparator

/***/ },
/* 119 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var React = __webpack_require__(6)

	module.exports = {
	    items      : React.PropTypes.array,
	    columns    : React.PropTypes.array,
	    onMount    : React.PropTypes.func,

	    defaultRowActiveStyle: React.PropTypes.object,
	    defaultRowOverStyle  : React.PropTypes.object,
	    defaultRowStyle      : React.PropTypes.object,

	    rowActiveStyle: React.PropTypes.object,
	    rowOverStyle  : React.PropTypes.object,
	    rowStyle      : React.PropTypes.object,

	    cellStyle  : React.PropTypes.object
	}

/***/ },
/* 120 */
/***/ function(module, exports, __webpack_require__) {

	'use strict'

	var React    = __webpack_require__(6)
	var assign   = __webpack_require__(7)
	var buffer   = __webpack_require__(121)

	var Scroller = __webpack_require__(122)

	function stop(event){
	    event.preventDefault()
	    event.stopPropagation()
	}

	module.exports = React.createClass({

	    displayName: 'ReactMenuScrollContainer',

	    getInitialState: function(){
	        return {
	            adjustScroll: true,
	            scrollPos: 0
	        }
	    },

	    getDefaultProps: function() {
	        return {
	            scrollStep : 5,
	            scrollSpeed: 50
	        }
	    },

	    componentWillUnmount: function(){
	        if (this.props.enableScroll){
	            window.removeEventListener('resize', this.onResizeListener)
	        }
	    },

	    componentDidMount: function(){
	        if (this.props.enableScroll){
	            setTimeout(function(){
	                if (!this.isMounted()){
	                    return
	                }

	                this.adjustScroll()

	                window.addEventListener('resize', this.onResizeListener = buffer(this.onWindowResize, this.props.onWindowResizeBuffer, this))
	            }.bind(this), 0)
	        }
	    },

	    componentDidUpdate: function(){
	        this.props.enableScroll && this.adjustScroll()
	    },

	    onWindowResize: function(){
	        this.adjustScroll()
	        this.doScroll(0)
	    },

	    render: function(){

	        var props = this.props
	        var children = props.children

	        if (!props.enableScroll){
	            return children
	        }

	        var scrollStyle = {
	            position: 'relative'
	        }

	        if (this.state.scrollPos){
	            scrollStyle.top = -this.state.scrollPos
	        }

	        var containerStyle = {
	            position: 'relative',
	            overflow: 'hidden'
	        }

	        if (props.maxHeight){
	            containerStyle.maxHeight = props.maxHeight
	        }

	        return React.createElement("div", {
	            onMouseEnter: props.onMouseEnter, 
	            onMouseLeave: props.onMouseLeave, 
	            className: "z-menu-scroll-container", 
	            style: containerStyle
	        }, 
	            React.createElement("div", {ref: "tableWrap", style: scrollStyle}, 
	                children
	            ), 
	            this.renderScroller(props, -1), 
	            this.renderScroller(props, 1)
	        )
	    },

	    renderScroller: function(props, direction) {

	        var onMouseDown = direction == -1?
	                            this.handleScrollTop:
	                            this.handleScrollBottom

	        var onDoubleClick = direction == -1?
	                                this.handleScrollTopMax:
	                                this.handleScrollBottomMax

	        var visible = direction == -1?
	                            this.state.hasTopScroll:
	                            this.state.hasBottomScroll

	        var scrollerProps = assign({}, props.scrollerProps, {
	            visible    : visible,
	            side       : direction == -1? 'top': 'bottom',
	            onMouseDown: onMouseDown,
	            onDoubleClick: onDoubleClick
	        })

	        return React.createElement(Scroller, React.__spread({},  scrollerProps))
	    },

	    adjustScroll: function(){
	        if (!this.props.enableScroll){
	            return
	        }

	        if (!this.state.adjustScroll){
	            this.state.adjustScroll = true
	            return
	        }

	        var availableHeight = this.getAvailableHeight()
	        var tableHeight      = this.getCurrentTableHeight()

	        var state = {
	            adjustScroll  : false,
	            hasTopScroll : false,
	            hasBottomScroll: false
	        }

	        if (tableHeight > availableHeight){
	            state.maxScrollPos    = tableHeight - availableHeight
	            state.hasTopScroll    = this.state.scrollPos !== 0
	            state.hasBottomScroll = this.state.scrollPos != state.maxScrollPos
	        } else {
	            state.maxScrollPos = 0
	            state.scrollPos    = 0
	        }

	        this.setState(state)
	    },

	    getAvailableHeight: function() {
	        return this.getAvailableSizeDOM().clientHeight
	    },

	    getAvailableSizeDOM: function() {
	        return this.getDOMNode()
	    },

	    getCurrentTableHeight: function() {
	        return this.getCurrentSizeDOM().clientHeight
	    },

	    getCurrentSizeDOM: function() {
	        return this.refs.tableWrap.getDOMNode()
	    },

	    handleScrollTop: function(event){
	        event.preventDefault()
	        this.handleScroll(-1)
	    },

	    handleScrollBottom: function(event){
	        event.preventDefault()
	        this.handleScroll(1)
	    },

	    handleScrollTopMax: function(event){
	        stop(event)
	        this.handleScrollMax(-1)
	    },

	    handleScrollBottomMax: function(event){
	        stop(event)
	        this.handleScrollMax(1)
	    },

	    handleScrollMax: function(direction){
	        var maxPos = direction == -1?
	                        0:
	                        this.state.maxScrollPos

	        this.setScrollPosition(maxPos)
	    },

	    handleScroll: function(direction /*1 to bottom, -1 to up*/){
	        var mouseUpListener = function(){
	            this.stopScroll()
	            window.removeEventListener('mouseup', mouseUpListener)
	        }.bind(this)

	        window.addEventListener('mouseup', mouseUpListener)

	        this.scrollInterval = setInterval(this.doScroll.bind(this, direction), this.props.scrollSpeed)
	    },

	    doScroll: function(direction){
	        this.setState({
	            scrollDirection: direction
	        })

	        var newScrollPos = this.state.scrollPos + direction * this.props.scrollStep

	        this.setScrollPosition(newScrollPos)
	    },

	    setScrollPosition: function(scrollPos){
	        if (scrollPos > this.state.maxScrollPos){
	            scrollPos = this.state.maxScrollPos
	        }

	        if (scrollPos < 0){
	            scrollPos = 0
	        }

	        this.setState({
	            scrollPos: scrollPos,
	            scrolling : true
	        })
	    },

	    stopScroll: function(){
	        clearInterval(this.scrollInterval)

	        this.setState({
	            scrolling: false
	        })
	    }
	})

/***/ },
/* 121 */
/***/ function(module, exports) {

	/* WEBPACK VAR INJECTION */(function(global) {'use strict';

	var setImmediate   = global.setImmediate
	var clearImmediate = global.clearImmediate

	module.exports = function(fn, delay, scope){

	    var timeoutId = -1

	    return function(){

	        var self = scope || this
	        var args = arguments

	        if (delay < 0){
	            fn.apply(self, args)
	            return
	        }

	        var withTimeout = delay || !setImmediate
	        var clearFn = withTimeout?
	                        clearTimeout:
	                        clearImmediate
	        var setFn   = withTimeout?
	                        setTimeout:
	                        setImmediate

	        if (timeoutId !== -1){
	            clearFn(timeoutId)
	        }

	        timeoutId = setFn(function(){
	            fn.apply(self, args)
	            self = null
	        }, delay)
	    }
	}
	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ },
/* 122 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var React         = __webpack_require__(6)
	var assign        = __webpack_require__(7)
	var getArrowStyle = __webpack_require__(123)

	function emptyFn(){}

	var SCROLLER_STYLE = {
	    left      : 0,
	    right     : 0,
	    position  : 'absolute',
	    cursor    : 'pointer',
	    zIndex    : 1
	}

	function generateArrowStyle(props, state, overrideStyle){
	    var style = assign({}, overrideStyle)

	    var arrowConfig = {
	        color: style.color || props.arrowColor
	    }

	    var offset = 4
	    var width  = style.width  || props.arrowWidth  || props.arrowSize || (props.style.height - offset)
	    var height = style.height || props.arrowHeight || props.arrowSize || (props.style.height - offset)

	    arrowConfig.width  = width
	    arrowConfig.height = height

	    assign(style, getArrowStyle(props.side == 'top'? 'up':'down', arrowConfig))

	    style.display = 'inline-block'
	    style.position = 'absolute'

	    style.left = '50%'
	    style.marginLeft = -width

	    style.top = '50%'
	    style.marginTop = -height/2

	    if (state.active){
	        style.marginTop += props.side == 'top'? -1: 1
	    }

	    return style
	}

	var Scroller = React.createClass({displayName: "Scroller",

	    display: 'ReactMenuScroller',

	    getInitialState: function() {
	        return {}
	    },

	    getDefaultProps: function(){
	        return {
	            height: 10,
	            defaultStyle: {
	                background : 'white'
	            },
	            defaultOverStyle: {},
	            overStyle: {},

	            defaultTopStyle: {
	                borderBottom: '1px solid gray'
	            },
	            topStyle: {},
	            defaultBottomStyle: {
	                borderTop: '1px solid gray'
	            },
	            bottomStyle: {},

	            arrowColor: 'gray',

	            arrowStyle: {},
	            defaultArrowStyle: {},
	            defaultArrowOverStyle: {
	                color: 'rgb(74, 74, 74)'
	            },
	            arrowOverStyle: {}
	        }
	    },

	    handleMouseEnter: function() {
	        this.setState({
	            mouseOver: true
	        })
	    },

	    handleMouseLeave: function() {
	        this.setState({
	            mouseOver: false
	        })
	    },

	    handleMouseDown: function(event) {
	        this.setState({
	            active: true
	        })

	        ;(this.props.onMouseDown || emptyFn)(event)
	    },

	    handleMouseUp: function(event) {
	        this.setState({
	            active: false
	        })

	        ;(this.props.onMouseUp || emptyFn)(event)
	    },

	    render: function(){
	        var props = assign({}, this.props, {
	            onMouseEnter: this.handleMouseEnter,
	            onMouseLeave: this.handleMouseLeave,

	            onMouseDown: this.handleMouseDown,
	            onMouseUp  : this.handleMouseUp
	        })

	        var state = this.state
	        var side  = props.side

	        props.className = this.prepareClassName(props, state)

	        props.style = this.prepareStyle(props, state)

	        var arrowStyle = this.prepareArrowStyle(props, state)

	        return props.factory?
	                    props.factory(props, side):
	                    React.createElement("div", React.__spread({},  props), 
	                        React.createElement("div", {style: arrowStyle})
	                    )
	    },

	    prepareStyle: function(props, state) {
	        var defaultOverStyle
	        var overStyle

	        if (state.mouseOver){
	            overStyle        = props.overStyle
	            defaultOverStyle = props.defaultOverStyle
	        }

	        var defaultSideStyle = props.side == 'top'?
	                                props.defaultTopStyle:
	                                props.defaultBottomStyle
	        var sideStyle = props.side == 'top'?
	                            props.topStyle:
	                            props.bottomStyle

	        var style = assign({}, SCROLLER_STYLE,
	                            props.defaultStyle, defaultSideStyle, defaultOverStyle,
	                            props.style, sideStyle, overStyle)

	        style.height = style.height || props.height
	        style[props.side] = 0
	        if (!props.visible){
	            style.display = 'none'
	        }

	        return style
	    },

	    prepareClassName: function(props, state) {
	        //className
	        var className = props.className || ''
	        className += ' z-menu-scroller ' + props.side

	        if (props.active && props.visible){
	            className += ' active'
	        }

	        return className
	    },

	    prepareArrowStyle: function(props, state) {

	        var defaultArrowOverStyle
	        var arrowOverStyle

	        if (state.mouseOver){
	            defaultArrowOverStyle = props.defaultArrowOverStyle
	            arrowOverStyle        = props.arrowOverStyle
	        }

	        var arrowStyle = assign({}, props.defaultArrowStyle, defaultArrowOverStyle, props.arrowStyle, arrowOverStyle)

	        return generateArrowStyle(props, state, arrowStyle)
	    },

	    handleClick: function(event){
	        event.stopPropagation
	    }
	})

	module.exports = Scroller

/***/ },
/* 123 */
/***/ function(module, exports) {

	'use strict';

	module.exports = function arrowStyle(side, config){

	    var arrowSize   = config.size   || 8
	    var arrowWidth  = config.width  || arrowSize
	    var arrowHeight = config.height || arrowSize
	    var arrowColor  = config.color  || 'black'
	    var includePosition = config.includePosition

	    var style

	    if (side == 'up' || side == 'down'){

	        style = {
	            borderLeft : arrowWidth + 'px solid transparent',
	            borderRight: arrowWidth + 'px solid transparent'
	        }

	        if (includePosition){
	            style.marginTop = -Math.round(arrowHeight/2) + 'px'
	            style.position  = 'relative'
	            style.top       = '50%'
	        }

	        style[side === 'up'? 'borderBottom': 'borderTop'] = arrowHeight + 'px solid ' + arrowColor
	    }

	    if (side == 'left' || side == 'right'){

	        style = {
	            borderTop : arrowHeight + 'px solid transparent',
	            borderBottom: arrowHeight + 'px solid transparent'
	        }

	        if (includePosition){
	            style.marginLeft = -Math.round(arrowWidth/2) + 'px'
	            style.position   = 'relative'
	            style.left       = '50%'
	        }

	        style[side === 'left'? 'borderRight': 'borderLeft'] = arrowWidth + 'px solid ' + arrowColor
	    }

	    return style
	}

/***/ },
/* 124 */
/***/ function(module, exports) {

	'use strict';

	module.exports = {
	    default: {
	        // overStyle: {
	        //     background: 'rgb(202, 223, 255)'
	        // },
	        overStyle: {
	                    background: 'linear-gradient(to bottom, rgb(125, 191, 242) 0%, rgb(110, 184, 241) 50%, rgb(117, 188, 242) 100%)',
	                    color: 'white'
	                },
	        activeStyle: {
	            // background: 'rgb(118, 181, 231)',
	            //-6 lightness from overStyle
	            background: ' linear-gradient(to bottom, rgb(106,182,240) 0%,rgb(91,175,239) 50%,rgb(96,178,240) 100%)',
	            color: 'white'
	        },
	        expandedStyle: {
	            // background: 'rgb(215, 231, 255)',
	            background: 'linear-gradient(to bottom, rgb(162,210,246) 0%,rgb(151,204,245) 50%,rgb(154,206,246) 100%)',
	            color: 'white'
	        },
	        disabledStyle: {
	            color : 'gray',
	            cursor: 'default'
	        }
	    }
	}

/***/ },
/* 125 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(Buffer) {'use strict';

	function objectToString(o) {
	  return Object.prototype.toString.call(o);
	}

	// shim for Node's 'util' package
	// DO NOT REMOVE THIS! It is required for compatibility with EnderJS (http://enderjs.com/).
	var util = {
	  isArray: function (ar) {
	    return Array.isArray(ar) || (typeof ar === 'object' && objectToString(ar) === '[object Array]');
	  },
	  isDate: function (d) {
	    return typeof d === 'object' && objectToString(d) === '[object Date]';
	  },
	  isRegExp: function (re) {
	    return typeof re === 'object' && objectToString(re) === '[object RegExp]';
	  },
	  getRegExpFlags: function (re) {
	    var flags = '';
	    re.global && (flags += 'g');
	    re.ignoreCase && (flags += 'i');
	    re.multiline && (flags += 'm');
	    return flags;
	  }
	};


	if (true)
	  module.exports = clone;

	/**
	 * Clones (copies) an Object using deep copying.
	 *
	 * This function supports circular references by default, but if you are certain
	 * there are no circular references in your object, you can save some CPU time
	 * by calling clone(obj, false).
	 *
	 * Caution: if `circular` is false and `parent` contains circular references,
	 * your program may enter an infinite loop and crash.
	 *
	 * @param `parent` - the object to be cloned
	 * @param `circular` - set to true if the object to be cloned may contain
	 *    circular references. (optional - true by default)
	 * @param `depth` - set to a number if the object is only to be cloned to
	 *    a particular depth. (optional - defaults to Infinity)
	 * @param `prototype` - sets the prototype to be used when cloning an object.
	 *    (optional - defaults to parent prototype).
	*/

	function clone(parent, circular, depth, prototype) {
	  // maintain two arrays for circular references, where corresponding parents
	  // and children have the same index
	  var allParents = [];
	  var allChildren = [];

	  var useBuffer = typeof Buffer != 'undefined';

	  if (typeof circular == 'undefined')
	    circular = true;

	  if (typeof depth == 'undefined')
	    depth = Infinity;

	  // recurse this function so we don't reset allParents and allChildren
	  function _clone(parent, depth) {
	    // cloning null always returns null
	    if (parent === null)
	      return null;

	    if (depth == 0)
	      return parent;

	    var child;
	    var proto;
	    if (typeof parent != 'object') {
	      return parent;
	    }

	    if (util.isArray(parent)) {
	      child = [];
	    } else if (util.isRegExp(parent)) {
	      child = new RegExp(parent.source, util.getRegExpFlags(parent));
	      if (parent.lastIndex) child.lastIndex = parent.lastIndex;
	    } else if (util.isDate(parent)) {
	      child = new Date(parent.getTime());
	    } else if (useBuffer && Buffer.isBuffer(parent)) {
	      child = new Buffer(parent.length);
	      parent.copy(child);
	      return child;
	    } else {
	      if (typeof prototype == 'undefined') {
	        proto = Object.getPrototypeOf(parent);
	        child = Object.create(proto);
	      }
	      else {
	        child = Object.create(prototype);
	        proto = prototype;
	      }
	    }

	    if (circular) {
	      var index = allParents.indexOf(parent);

	      if (index != -1) {
	        return allChildren[index];
	      }
	      allParents.push(parent);
	      allChildren.push(child);
	    }

	    for (var i in parent) {
	      var attrs;
	      if (proto) {
	        attrs = Object.getOwnPropertyDescriptor(proto, i);
	      }
	      
	      if (attrs && attrs.set == null) {
	        continue;
	      }
	      child[i] = _clone(parent[i], depth - 1);
	    }

	    return child;
	  }

	  return _clone(parent, depth);
	}

	/**
	 * Simple flat clone using prototype, accepts only objects, usefull for property
	 * override on FLAT configuration object (no nested props).
	 *
	 * USE WITH CAUTION! This may not behave as you wish if you do not know how this
	 * works.
	 */
	clone.clonePrototype = function(parent) {
	  if (parent === null)
	    return null;

	  var c = function () {};
	  c.prototype = parent;
	  return new c();
	};

	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(126).Buffer))

/***/ },
/* 126 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(Buffer, global) {/*!
	 * The buffer module from node.js, for the browser.
	 *
	 * @author   Feross Aboukhadijeh <feross@feross.org> <http://feross.org>
	 * @license  MIT
	 */
	/* eslint-disable no-proto */

	'use strict'

	var base64 = __webpack_require__(127)
	var ieee754 = __webpack_require__(128)
	var isArray = __webpack_require__(129)

	exports.Buffer = Buffer
	exports.SlowBuffer = SlowBuffer
	exports.INSPECT_MAX_BYTES = 50
	Buffer.poolSize = 8192 // not used by this implementation

	var rootParent = {}

	/**
	 * If `Buffer.TYPED_ARRAY_SUPPORT`:
	 *   === true    Use Uint8Array implementation (fastest)
	 *   === false   Use Object implementation (most compatible, even IE6)
	 *
	 * Browsers that support typed arrays are IE 10+, Firefox 4+, Chrome 7+, Safari 5.1+,
	 * Opera 11.6+, iOS 4.2+.
	 *
	 * Due to various browser bugs, sometimes the Object implementation will be used even
	 * when the browser supports typed arrays.
	 *
	 * Note:
	 *
	 *   - Firefox 4-29 lacks support for adding new properties to `Uint8Array` instances,
	 *     See: https://bugzilla.mozilla.org/show_bug.cgi?id=695438.
	 *
	 *   - Safari 5-7 lacks support for changing the `Object.prototype.constructor` property
	 *     on objects.
	 *
	 *   - Chrome 9-10 is missing the `TypedArray.prototype.subarray` function.
	 *
	 *   - IE10 has a broken `TypedArray.prototype.subarray` function which returns arrays of
	 *     incorrect length in some situations.

	 * We detect these buggy browsers and set `Buffer.TYPED_ARRAY_SUPPORT` to `false` so they
	 * get the Object implementation, which is slower but behaves correctly.
	 */
	Buffer.TYPED_ARRAY_SUPPORT = global.TYPED_ARRAY_SUPPORT !== undefined
	  ? global.TYPED_ARRAY_SUPPORT
	  : typedArraySupport()

	function typedArraySupport () {
	  function Bar () {}
	  try {
	    var arr = new Uint8Array(1)
	    arr.foo = function () { return 42 }
	    arr.constructor = Bar
	    return arr.foo() === 42 && // typed array instances can be augmented
	        arr.constructor === Bar && // constructor can be set
	        typeof arr.subarray === 'function' && // chrome 9-10 lack `subarray`
	        arr.subarray(1, 1).byteLength === 0 // ie10 has broken `subarray`
	  } catch (e) {
	    return false
	  }
	}

	function kMaxLength () {
	  return Buffer.TYPED_ARRAY_SUPPORT
	    ? 0x7fffffff
	    : 0x3fffffff
	}

	/**
	 * Class: Buffer
	 * =============
	 *
	 * The Buffer constructor returns instances of `Uint8Array` that are augmented
	 * with function properties for all the node `Buffer` API functions. We use
	 * `Uint8Array` so that square bracket notation works as expected -- it returns
	 * a single octet.
	 *
	 * By augmenting the instances, we can avoid modifying the `Uint8Array`
	 * prototype.
	 */
	function Buffer (arg) {
	  if (!(this instanceof Buffer)) {
	    // Avoid going through an ArgumentsAdaptorTrampoline in the common case.
	    if (arguments.length > 1) return new Buffer(arg, arguments[1])
	    return new Buffer(arg)
	  }

	  if (!Buffer.TYPED_ARRAY_SUPPORT) {
	    this.length = 0
	    this.parent = undefined
	  }

	  // Common case.
	  if (typeof arg === 'number') {
	    return fromNumber(this, arg)
	  }

	  // Slightly less common case.
	  if (typeof arg === 'string') {
	    return fromString(this, arg, arguments.length > 1 ? arguments[1] : 'utf8')
	  }

	  // Unusual.
	  return fromObject(this, arg)
	}

	function fromNumber (that, length) {
	  that = allocate(that, length < 0 ? 0 : checked(length) | 0)
	  if (!Buffer.TYPED_ARRAY_SUPPORT) {
	    for (var i = 0; i < length; i++) {
	      that[i] = 0
	    }
	  }
	  return that
	}

	function fromString (that, string, encoding) {
	  if (typeof encoding !== 'string' || encoding === '') encoding = 'utf8'

	  // Assumption: byteLength() return value is always < kMaxLength.
	  var length = byteLength(string, encoding) | 0
	  that = allocate(that, length)

	  that.write(string, encoding)
	  return that
	}

	function fromObject (that, object) {
	  if (Buffer.isBuffer(object)) return fromBuffer(that, object)

	  if (isArray(object)) return fromArray(that, object)

	  if (object == null) {
	    throw new TypeError('must start with number, buffer, array or string')
	  }

	  if (typeof ArrayBuffer !== 'undefined') {
	    if (object.buffer instanceof ArrayBuffer) {
	      return fromTypedArray(that, object)
	    }
	    if (object instanceof ArrayBuffer) {
	      return fromArrayBuffer(that, object)
	    }
	  }

	  if (object.length) return fromArrayLike(that, object)

	  return fromJsonObject(that, object)
	}

	function fromBuffer (that, buffer) {
	  var length = checked(buffer.length) | 0
	  that = allocate(that, length)
	  buffer.copy(that, 0, 0, length)
	  return that
	}

	function fromArray (that, array) {
	  var length = checked(array.length) | 0
	  that = allocate(that, length)
	  for (var i = 0; i < length; i += 1) {
	    that[i] = array[i] & 255
	  }
	  return that
	}

	// Duplicate of fromArray() to keep fromArray() monomorphic.
	function fromTypedArray (that, array) {
	  var length = checked(array.length) | 0
	  that = allocate(that, length)
	  // Truncating the elements is probably not what people expect from typed
	  // arrays with BYTES_PER_ELEMENT > 1 but it's compatible with the behavior
	  // of the old Buffer constructor.
	  for (var i = 0; i < length; i += 1) {
	    that[i] = array[i] & 255
	  }
	  return that
	}

	function fromArrayBuffer (that, array) {
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    // Return an augmented `Uint8Array` instance, for best performance
	    array.byteLength
	    that = Buffer._augment(new Uint8Array(array))
	  } else {
	    // Fallback: Return an object instance of the Buffer class
	    that = fromTypedArray(that, new Uint8Array(array))
	  }
	  return that
	}

	function fromArrayLike (that, array) {
	  var length = checked(array.length) | 0
	  that = allocate(that, length)
	  for (var i = 0; i < length; i += 1) {
	    that[i] = array[i] & 255
	  }
	  return that
	}

	// Deserialize { type: 'Buffer', data: [1,2,3,...] } into a Buffer object.
	// Returns a zero-length buffer for inputs that don't conform to the spec.
	function fromJsonObject (that, object) {
	  var array
	  var length = 0

	  if (object.type === 'Buffer' && isArray(object.data)) {
	    array = object.data
	    length = checked(array.length) | 0
	  }
	  that = allocate(that, length)

	  for (var i = 0; i < length; i += 1) {
	    that[i] = array[i] & 255
	  }
	  return that
	}

	if (Buffer.TYPED_ARRAY_SUPPORT) {
	  Buffer.prototype.__proto__ = Uint8Array.prototype
	  Buffer.__proto__ = Uint8Array
	} else {
	  // pre-set for values that may exist in the future
	  Buffer.prototype.length = undefined
	  Buffer.prototype.parent = undefined
	}

	function allocate (that, length) {
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    // Return an augmented `Uint8Array` instance, for best performance
	    that = Buffer._augment(new Uint8Array(length))
	    that.__proto__ = Buffer.prototype
	  } else {
	    // Fallback: Return an object instance of the Buffer class
	    that.length = length
	    that._isBuffer = true
	  }

	  var fromPool = length !== 0 && length <= Buffer.poolSize >>> 1
	  if (fromPool) that.parent = rootParent

	  return that
	}

	function checked (length) {
	  // Note: cannot use `length < kMaxLength` here because that fails when
	  // length is NaN (which is otherwise coerced to zero.)
	  if (length >= kMaxLength()) {
	    throw new RangeError('Attempt to allocate Buffer larger than maximum ' +
	                         'size: 0x' + kMaxLength().toString(16) + ' bytes')
	  }
	  return length | 0
	}

	function SlowBuffer (subject, encoding) {
	  if (!(this instanceof SlowBuffer)) return new SlowBuffer(subject, encoding)

	  var buf = new Buffer(subject, encoding)
	  delete buf.parent
	  return buf
	}

	Buffer.isBuffer = function isBuffer (b) {
	  return !!(b != null && b._isBuffer)
	}

	Buffer.compare = function compare (a, b) {
	  if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b)) {
	    throw new TypeError('Arguments must be Buffers')
	  }

	  if (a === b) return 0

	  var x = a.length
	  var y = b.length

	  var i = 0
	  var len = Math.min(x, y)
	  while (i < len) {
	    if (a[i] !== b[i]) break

	    ++i
	  }

	  if (i !== len) {
	    x = a[i]
	    y = b[i]
	  }

	  if (x < y) return -1
	  if (y < x) return 1
	  return 0
	}

	Buffer.isEncoding = function isEncoding (encoding) {
	  switch (String(encoding).toLowerCase()) {
	    case 'hex':
	    case 'utf8':
	    case 'utf-8':
	    case 'ascii':
	    case 'binary':
	    case 'base64':
	    case 'raw':
	    case 'ucs2':
	    case 'ucs-2':
	    case 'utf16le':
	    case 'utf-16le':
	      return true
	    default:
	      return false
	  }
	}

	Buffer.concat = function concat (list, length) {
	  if (!isArray(list)) throw new TypeError('list argument must be an Array of Buffers.')

	  if (list.length === 0) {
	    return new Buffer(0)
	  }

	  var i
	  if (length === undefined) {
	    length = 0
	    for (i = 0; i < list.length; i++) {
	      length += list[i].length
	    }
	  }

	  var buf = new Buffer(length)
	  var pos = 0
	  for (i = 0; i < list.length; i++) {
	    var item = list[i]
	    item.copy(buf, pos)
	    pos += item.length
	  }
	  return buf
	}

	function byteLength (string, encoding) {
	  if (typeof string !== 'string') string = '' + string

	  var len = string.length
	  if (len === 0) return 0

	  // Use a for loop to avoid recursion
	  var loweredCase = false
	  for (;;) {
	    switch (encoding) {
	      case 'ascii':
	      case 'binary':
	      // Deprecated
	      case 'raw':
	      case 'raws':
	        return len
	      case 'utf8':
	      case 'utf-8':
	        return utf8ToBytes(string).length
	      case 'ucs2':
	      case 'ucs-2':
	      case 'utf16le':
	      case 'utf-16le':
	        return len * 2
	      case 'hex':
	        return len >>> 1
	      case 'base64':
	        return base64ToBytes(string).length
	      default:
	        if (loweredCase) return utf8ToBytes(string).length // assume utf8
	        encoding = ('' + encoding).toLowerCase()
	        loweredCase = true
	    }
	  }
	}
	Buffer.byteLength = byteLength

	function slowToString (encoding, start, end) {
	  var loweredCase = false

	  start = start | 0
	  end = end === undefined || end === Infinity ? this.length : end | 0

	  if (!encoding) encoding = 'utf8'
	  if (start < 0) start = 0
	  if (end > this.length) end = this.length
	  if (end <= start) return ''

	  while (true) {
	    switch (encoding) {
	      case 'hex':
	        return hexSlice(this, start, end)

	      case 'utf8':
	      case 'utf-8':
	        return utf8Slice(this, start, end)

	      case 'ascii':
	        return asciiSlice(this, start, end)

	      case 'binary':
	        return binarySlice(this, start, end)

	      case 'base64':
	        return base64Slice(this, start, end)

	      case 'ucs2':
	      case 'ucs-2':
	      case 'utf16le':
	      case 'utf-16le':
	        return utf16leSlice(this, start, end)

	      default:
	        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
	        encoding = (encoding + '').toLowerCase()
	        loweredCase = true
	    }
	  }
	}

	Buffer.prototype.toString = function toString () {
	  var length = this.length | 0
	  if (length === 0) return ''
	  if (arguments.length === 0) return utf8Slice(this, 0, length)
	  return slowToString.apply(this, arguments)
	}

	Buffer.prototype.equals = function equals (b) {
	  if (!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer')
	  if (this === b) return true
	  return Buffer.compare(this, b) === 0
	}

	Buffer.prototype.inspect = function inspect () {
	  var str = ''
	  var max = exports.INSPECT_MAX_BYTES
	  if (this.length > 0) {
	    str = this.toString('hex', 0, max).match(/.{2}/g).join(' ')
	    if (this.length > max) str += ' ... '
	  }
	  return '<Buffer ' + str + '>'
	}

	Buffer.prototype.compare = function compare (b) {
	  if (!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer')
	  if (this === b) return 0
	  return Buffer.compare(this, b)
	}

	Buffer.prototype.indexOf = function indexOf (val, byteOffset) {
	  if (byteOffset > 0x7fffffff) byteOffset = 0x7fffffff
	  else if (byteOffset < -0x80000000) byteOffset = -0x80000000
	  byteOffset >>= 0

	  if (this.length === 0) return -1
	  if (byteOffset >= this.length) return -1

	  // Negative offsets start from the end of the buffer
	  if (byteOffset < 0) byteOffset = Math.max(this.length + byteOffset, 0)

	  if (typeof val === 'string') {
	    if (val.length === 0) return -1 // special case: looking for empty string always fails
	    return String.prototype.indexOf.call(this, val, byteOffset)
	  }
	  if (Buffer.isBuffer(val)) {
	    return arrayIndexOf(this, val, byteOffset)
	  }
	  if (typeof val === 'number') {
	    if (Buffer.TYPED_ARRAY_SUPPORT && Uint8Array.prototype.indexOf === 'function') {
	      return Uint8Array.prototype.indexOf.call(this, val, byteOffset)
	    }
	    return arrayIndexOf(this, [ val ], byteOffset)
	  }

	  function arrayIndexOf (arr, val, byteOffset) {
	    var foundIndex = -1
	    for (var i = 0; byteOffset + i < arr.length; i++) {
	      if (arr[byteOffset + i] === val[foundIndex === -1 ? 0 : i - foundIndex]) {
	        if (foundIndex === -1) foundIndex = i
	        if (i - foundIndex + 1 === val.length) return byteOffset + foundIndex
	      } else {
	        foundIndex = -1
	      }
	    }
	    return -1
	  }

	  throw new TypeError('val must be string, number or Buffer')
	}

	// `get` is deprecated
	Buffer.prototype.get = function get (offset) {
	  console.log('.get() is deprecated. Access using array indexes instead.')
	  return this.readUInt8(offset)
	}

	// `set` is deprecated
	Buffer.prototype.set = function set (v, offset) {
	  console.log('.set() is deprecated. Access using array indexes instead.')
	  return this.writeUInt8(v, offset)
	}

	function hexWrite (buf, string, offset, length) {
	  offset = Number(offset) || 0
	  var remaining = buf.length - offset
	  if (!length) {
	    length = remaining
	  } else {
	    length = Number(length)
	    if (length > remaining) {
	      length = remaining
	    }
	  }

	  // must be an even number of digits
	  var strLen = string.length
	  if (strLen % 2 !== 0) throw new Error('Invalid hex string')

	  if (length > strLen / 2) {
	    length = strLen / 2
	  }
	  for (var i = 0; i < length; i++) {
	    var parsed = parseInt(string.substr(i * 2, 2), 16)
	    if (isNaN(parsed)) throw new Error('Invalid hex string')
	    buf[offset + i] = parsed
	  }
	  return i
	}

	function utf8Write (buf, string, offset, length) {
	  return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length)
	}

	function asciiWrite (buf, string, offset, length) {
	  return blitBuffer(asciiToBytes(string), buf, offset, length)
	}

	function binaryWrite (buf, string, offset, length) {
	  return asciiWrite(buf, string, offset, length)
	}

	function base64Write (buf, string, offset, length) {
	  return blitBuffer(base64ToBytes(string), buf, offset, length)
	}

	function ucs2Write (buf, string, offset, length) {
	  return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length)
	}

	Buffer.prototype.write = function write (string, offset, length, encoding) {
	  // Buffer#write(string)
	  if (offset === undefined) {
	    encoding = 'utf8'
	    length = this.length
	    offset = 0
	  // Buffer#write(string, encoding)
	  } else if (length === undefined && typeof offset === 'string') {
	    encoding = offset
	    length = this.length
	    offset = 0
	  // Buffer#write(string, offset[, length][, encoding])
	  } else if (isFinite(offset)) {
	    offset = offset | 0
	    if (isFinite(length)) {
	      length = length | 0
	      if (encoding === undefined) encoding = 'utf8'
	    } else {
	      encoding = length
	      length = undefined
	    }
	  // legacy write(string, encoding, offset, length) - remove in v0.13
	  } else {
	    var swap = encoding
	    encoding = offset
	    offset = length | 0
	    length = swap
	  }

	  var remaining = this.length - offset
	  if (length === undefined || length > remaining) length = remaining

	  if ((string.length > 0 && (length < 0 || offset < 0)) || offset > this.length) {
	    throw new RangeError('attempt to write outside buffer bounds')
	  }

	  if (!encoding) encoding = 'utf8'

	  var loweredCase = false
	  for (;;) {
	    switch (encoding) {
	      case 'hex':
	        return hexWrite(this, string, offset, length)

	      case 'utf8':
	      case 'utf-8':
	        return utf8Write(this, string, offset, length)

	      case 'ascii':
	        return asciiWrite(this, string, offset, length)

	      case 'binary':
	        return binaryWrite(this, string, offset, length)

	      case 'base64':
	        // Warning: maxLength not taken into account in base64Write
	        return base64Write(this, string, offset, length)

	      case 'ucs2':
	      case 'ucs-2':
	      case 'utf16le':
	      case 'utf-16le':
	        return ucs2Write(this, string, offset, length)

	      default:
	        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
	        encoding = ('' + encoding).toLowerCase()
	        loweredCase = true
	    }
	  }
	}

	Buffer.prototype.toJSON = function toJSON () {
	  return {
	    type: 'Buffer',
	    data: Array.prototype.slice.call(this._arr || this, 0)
	  }
	}

	function base64Slice (buf, start, end) {
	  if (start === 0 && end === buf.length) {
	    return base64.fromByteArray(buf)
	  } else {
	    return base64.fromByteArray(buf.slice(start, end))
	  }
	}

	function utf8Slice (buf, start, end) {
	  end = Math.min(buf.length, end)
	  var res = []

	  var i = start
	  while (i < end) {
	    var firstByte = buf[i]
	    var codePoint = null
	    var bytesPerSequence = (firstByte > 0xEF) ? 4
	      : (firstByte > 0xDF) ? 3
	      : (firstByte > 0xBF) ? 2
	      : 1

	    if (i + bytesPerSequence <= end) {
	      var secondByte, thirdByte, fourthByte, tempCodePoint

	      switch (bytesPerSequence) {
	        case 1:
	          if (firstByte < 0x80) {
	            codePoint = firstByte
	          }
	          break
	        case 2:
	          secondByte = buf[i + 1]
	          if ((secondByte & 0xC0) === 0x80) {
	            tempCodePoint = (firstByte & 0x1F) << 0x6 | (secondByte & 0x3F)
	            if (tempCodePoint > 0x7F) {
	              codePoint = tempCodePoint
	            }
	          }
	          break
	        case 3:
	          secondByte = buf[i + 1]
	          thirdByte = buf[i + 2]
	          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80) {
	            tempCodePoint = (firstByte & 0xF) << 0xC | (secondByte & 0x3F) << 0x6 | (thirdByte & 0x3F)
	            if (tempCodePoint > 0x7FF && (tempCodePoint < 0xD800 || tempCodePoint > 0xDFFF)) {
	              codePoint = tempCodePoint
	            }
	          }
	          break
	        case 4:
	          secondByte = buf[i + 1]
	          thirdByte = buf[i + 2]
	          fourthByte = buf[i + 3]
	          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80 && (fourthByte & 0xC0) === 0x80) {
	            tempCodePoint = (firstByte & 0xF) << 0x12 | (secondByte & 0x3F) << 0xC | (thirdByte & 0x3F) << 0x6 | (fourthByte & 0x3F)
	            if (tempCodePoint > 0xFFFF && tempCodePoint < 0x110000) {
	              codePoint = tempCodePoint
	            }
	          }
	      }
	    }

	    if (codePoint === null) {
	      // we did not generate a valid codePoint so insert a
	      // replacement char (U+FFFD) and advance only 1 byte
	      codePoint = 0xFFFD
	      bytesPerSequence = 1
	    } else if (codePoint > 0xFFFF) {
	      // encode to utf16 (surrogate pair dance)
	      codePoint -= 0x10000
	      res.push(codePoint >>> 10 & 0x3FF | 0xD800)
	      codePoint = 0xDC00 | codePoint & 0x3FF
	    }

	    res.push(codePoint)
	    i += bytesPerSequence
	  }

	  return decodeCodePointsArray(res)
	}

	// Based on http://stackoverflow.com/a/22747272/680742, the browser with
	// the lowest limit is Chrome, with 0x10000 args.
	// We go 1 magnitude less, for safety
	var MAX_ARGUMENTS_LENGTH = 0x1000

	function decodeCodePointsArray (codePoints) {
	  var len = codePoints.length
	  if (len <= MAX_ARGUMENTS_LENGTH) {
	    return String.fromCharCode.apply(String, codePoints) // avoid extra slice()
	  }

	  // Decode in chunks to avoid "call stack size exceeded".
	  var res = ''
	  var i = 0
	  while (i < len) {
	    res += String.fromCharCode.apply(
	      String,
	      codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH)
	    )
	  }
	  return res
	}

	function asciiSlice (buf, start, end) {
	  var ret = ''
	  end = Math.min(buf.length, end)

	  for (var i = start; i < end; i++) {
	    ret += String.fromCharCode(buf[i] & 0x7F)
	  }
	  return ret
	}

	function binarySlice (buf, start, end) {
	  var ret = ''
	  end = Math.min(buf.length, end)

	  for (var i = start; i < end; i++) {
	    ret += String.fromCharCode(buf[i])
	  }
	  return ret
	}

	function hexSlice (buf, start, end) {
	  var len = buf.length

	  if (!start || start < 0) start = 0
	  if (!end || end < 0 || end > len) end = len

	  var out = ''
	  for (var i = start; i < end; i++) {
	    out += toHex(buf[i])
	  }
	  return out
	}

	function utf16leSlice (buf, start, end) {
	  var bytes = buf.slice(start, end)
	  var res = ''
	  for (var i = 0; i < bytes.length; i += 2) {
	    res += String.fromCharCode(bytes[i] + bytes[i + 1] * 256)
	  }
	  return res
	}

	Buffer.prototype.slice = function slice (start, end) {
	  var len = this.length
	  start = ~~start
	  end = end === undefined ? len : ~~end

	  if (start < 0) {
	    start += len
	    if (start < 0) start = 0
	  } else if (start > len) {
	    start = len
	  }

	  if (end < 0) {
	    end += len
	    if (end < 0) end = 0
	  } else if (end > len) {
	    end = len
	  }

	  if (end < start) end = start

	  var newBuf
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    newBuf = Buffer._augment(this.subarray(start, end))
	  } else {
	    var sliceLen = end - start
	    newBuf = new Buffer(sliceLen, undefined)
	    for (var i = 0; i < sliceLen; i++) {
	      newBuf[i] = this[i + start]
	    }
	  }

	  if (newBuf.length) newBuf.parent = this.parent || this

	  return newBuf
	}

	/*
	 * Need to make sure that buffer isn't trying to write out of bounds.
	 */
	function checkOffset (offset, ext, length) {
	  if ((offset % 1) !== 0 || offset < 0) throw new RangeError('offset is not uint')
	  if (offset + ext > length) throw new RangeError('Trying to access beyond buffer length')
	}

	Buffer.prototype.readUIntLE = function readUIntLE (offset, byteLength, noAssert) {
	  offset = offset | 0
	  byteLength = byteLength | 0
	  if (!noAssert) checkOffset(offset, byteLength, this.length)

	  var val = this[offset]
	  var mul = 1
	  var i = 0
	  while (++i < byteLength && (mul *= 0x100)) {
	    val += this[offset + i] * mul
	  }

	  return val
	}

	Buffer.prototype.readUIntBE = function readUIntBE (offset, byteLength, noAssert) {
	  offset = offset | 0
	  byteLength = byteLength | 0
	  if (!noAssert) {
	    checkOffset(offset, byteLength, this.length)
	  }

	  var val = this[offset + --byteLength]
	  var mul = 1
	  while (byteLength > 0 && (mul *= 0x100)) {
	    val += this[offset + --byteLength] * mul
	  }

	  return val
	}

	Buffer.prototype.readUInt8 = function readUInt8 (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 1, this.length)
	  return this[offset]
	}

	Buffer.prototype.readUInt16LE = function readUInt16LE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 2, this.length)
	  return this[offset] | (this[offset + 1] << 8)
	}

	Buffer.prototype.readUInt16BE = function readUInt16BE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 2, this.length)
	  return (this[offset] << 8) | this[offset + 1]
	}

	Buffer.prototype.readUInt32LE = function readUInt32LE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 4, this.length)

	  return ((this[offset]) |
	      (this[offset + 1] << 8) |
	      (this[offset + 2] << 16)) +
	      (this[offset + 3] * 0x1000000)
	}

	Buffer.prototype.readUInt32BE = function readUInt32BE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 4, this.length)

	  return (this[offset] * 0x1000000) +
	    ((this[offset + 1] << 16) |
	    (this[offset + 2] << 8) |
	    this[offset + 3])
	}

	Buffer.prototype.readIntLE = function readIntLE (offset, byteLength, noAssert) {
	  offset = offset | 0
	  byteLength = byteLength | 0
	  if (!noAssert) checkOffset(offset, byteLength, this.length)

	  var val = this[offset]
	  var mul = 1
	  var i = 0
	  while (++i < byteLength && (mul *= 0x100)) {
	    val += this[offset + i] * mul
	  }
	  mul *= 0x80

	  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

	  return val
	}

	Buffer.prototype.readIntBE = function readIntBE (offset, byteLength, noAssert) {
	  offset = offset | 0
	  byteLength = byteLength | 0
	  if (!noAssert) checkOffset(offset, byteLength, this.length)

	  var i = byteLength
	  var mul = 1
	  var val = this[offset + --i]
	  while (i > 0 && (mul *= 0x100)) {
	    val += this[offset + --i] * mul
	  }
	  mul *= 0x80

	  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

	  return val
	}

	Buffer.prototype.readInt8 = function readInt8 (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 1, this.length)
	  if (!(this[offset] & 0x80)) return (this[offset])
	  return ((0xff - this[offset] + 1) * -1)
	}

	Buffer.prototype.readInt16LE = function readInt16LE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 2, this.length)
	  var val = this[offset] | (this[offset + 1] << 8)
	  return (val & 0x8000) ? val | 0xFFFF0000 : val
	}

	Buffer.prototype.readInt16BE = function readInt16BE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 2, this.length)
	  var val = this[offset + 1] | (this[offset] << 8)
	  return (val & 0x8000) ? val | 0xFFFF0000 : val
	}

	Buffer.prototype.readInt32LE = function readInt32LE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 4, this.length)

	  return (this[offset]) |
	    (this[offset + 1] << 8) |
	    (this[offset + 2] << 16) |
	    (this[offset + 3] << 24)
	}

	Buffer.prototype.readInt32BE = function readInt32BE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 4, this.length)

	  return (this[offset] << 24) |
	    (this[offset + 1] << 16) |
	    (this[offset + 2] << 8) |
	    (this[offset + 3])
	}

	Buffer.prototype.readFloatLE = function readFloatLE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 4, this.length)
	  return ieee754.read(this, offset, true, 23, 4)
	}

	Buffer.prototype.readFloatBE = function readFloatBE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 4, this.length)
	  return ieee754.read(this, offset, false, 23, 4)
	}

	Buffer.prototype.readDoubleLE = function readDoubleLE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 8, this.length)
	  return ieee754.read(this, offset, true, 52, 8)
	}

	Buffer.prototype.readDoubleBE = function readDoubleBE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 8, this.length)
	  return ieee754.read(this, offset, false, 52, 8)
	}

	function checkInt (buf, value, offset, ext, max, min) {
	  if (!Buffer.isBuffer(buf)) throw new TypeError('buffer must be a Buffer instance')
	  if (value > max || value < min) throw new RangeError('value is out of bounds')
	  if (offset + ext > buf.length) throw new RangeError('index out of range')
	}

	Buffer.prototype.writeUIntLE = function writeUIntLE (value, offset, byteLength, noAssert) {
	  value = +value
	  offset = offset | 0
	  byteLength = byteLength | 0
	  if (!noAssert) checkInt(this, value, offset, byteLength, Math.pow(2, 8 * byteLength), 0)

	  var mul = 1
	  var i = 0
	  this[offset] = value & 0xFF
	  while (++i < byteLength && (mul *= 0x100)) {
	    this[offset + i] = (value / mul) & 0xFF
	  }

	  return offset + byteLength
	}

	Buffer.prototype.writeUIntBE = function writeUIntBE (value, offset, byteLength, noAssert) {
	  value = +value
	  offset = offset | 0
	  byteLength = byteLength | 0
	  if (!noAssert) checkInt(this, value, offset, byteLength, Math.pow(2, 8 * byteLength), 0)

	  var i = byteLength - 1
	  var mul = 1
	  this[offset + i] = value & 0xFF
	  while (--i >= 0 && (mul *= 0x100)) {
	    this[offset + i] = (value / mul) & 0xFF
	  }

	  return offset + byteLength
	}

	Buffer.prototype.writeUInt8 = function writeUInt8 (value, offset, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) checkInt(this, value, offset, 1, 0xff, 0)
	  if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value)
	  this[offset] = (value & 0xff)
	  return offset + 1
	}

	function objectWriteUInt16 (buf, value, offset, littleEndian) {
	  if (value < 0) value = 0xffff + value + 1
	  for (var i = 0, j = Math.min(buf.length - offset, 2); i < j; i++) {
	    buf[offset + i] = (value & (0xff << (8 * (littleEndian ? i : 1 - i)))) >>>
	      (littleEndian ? i : 1 - i) * 8
	  }
	}

	Buffer.prototype.writeUInt16LE = function writeUInt16LE (value, offset, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    this[offset] = (value & 0xff)
	    this[offset + 1] = (value >>> 8)
	  } else {
	    objectWriteUInt16(this, value, offset, true)
	  }
	  return offset + 2
	}

	Buffer.prototype.writeUInt16BE = function writeUInt16BE (value, offset, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    this[offset] = (value >>> 8)
	    this[offset + 1] = (value & 0xff)
	  } else {
	    objectWriteUInt16(this, value, offset, false)
	  }
	  return offset + 2
	}

	function objectWriteUInt32 (buf, value, offset, littleEndian) {
	  if (value < 0) value = 0xffffffff + value + 1
	  for (var i = 0, j = Math.min(buf.length - offset, 4); i < j; i++) {
	    buf[offset + i] = (value >>> (littleEndian ? i : 3 - i) * 8) & 0xff
	  }
	}

	Buffer.prototype.writeUInt32LE = function writeUInt32LE (value, offset, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    this[offset + 3] = (value >>> 24)
	    this[offset + 2] = (value >>> 16)
	    this[offset + 1] = (value >>> 8)
	    this[offset] = (value & 0xff)
	  } else {
	    objectWriteUInt32(this, value, offset, true)
	  }
	  return offset + 4
	}

	Buffer.prototype.writeUInt32BE = function writeUInt32BE (value, offset, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    this[offset] = (value >>> 24)
	    this[offset + 1] = (value >>> 16)
	    this[offset + 2] = (value >>> 8)
	    this[offset + 3] = (value & 0xff)
	  } else {
	    objectWriteUInt32(this, value, offset, false)
	  }
	  return offset + 4
	}

	Buffer.prototype.writeIntLE = function writeIntLE (value, offset, byteLength, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) {
	    var limit = Math.pow(2, 8 * byteLength - 1)

	    checkInt(this, value, offset, byteLength, limit - 1, -limit)
	  }

	  var i = 0
	  var mul = 1
	  var sub = value < 0 ? 1 : 0
	  this[offset] = value & 0xFF
	  while (++i < byteLength && (mul *= 0x100)) {
	    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
	  }

	  return offset + byteLength
	}

	Buffer.prototype.writeIntBE = function writeIntBE (value, offset, byteLength, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) {
	    var limit = Math.pow(2, 8 * byteLength - 1)

	    checkInt(this, value, offset, byteLength, limit - 1, -limit)
	  }

	  var i = byteLength - 1
	  var mul = 1
	  var sub = value < 0 ? 1 : 0
	  this[offset + i] = value & 0xFF
	  while (--i >= 0 && (mul *= 0x100)) {
	    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
	  }

	  return offset + byteLength
	}

	Buffer.prototype.writeInt8 = function writeInt8 (value, offset, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) checkInt(this, value, offset, 1, 0x7f, -0x80)
	  if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value)
	  if (value < 0) value = 0xff + value + 1
	  this[offset] = (value & 0xff)
	  return offset + 1
	}

	Buffer.prototype.writeInt16LE = function writeInt16LE (value, offset, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    this[offset] = (value & 0xff)
	    this[offset + 1] = (value >>> 8)
	  } else {
	    objectWriteUInt16(this, value, offset, true)
	  }
	  return offset + 2
	}

	Buffer.prototype.writeInt16BE = function writeInt16BE (value, offset, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    this[offset] = (value >>> 8)
	    this[offset + 1] = (value & 0xff)
	  } else {
	    objectWriteUInt16(this, value, offset, false)
	  }
	  return offset + 2
	}

	Buffer.prototype.writeInt32LE = function writeInt32LE (value, offset, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    this[offset] = (value & 0xff)
	    this[offset + 1] = (value >>> 8)
	    this[offset + 2] = (value >>> 16)
	    this[offset + 3] = (value >>> 24)
	  } else {
	    objectWriteUInt32(this, value, offset, true)
	  }
	  return offset + 4
	}

	Buffer.prototype.writeInt32BE = function writeInt32BE (value, offset, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
	  if (value < 0) value = 0xffffffff + value + 1
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    this[offset] = (value >>> 24)
	    this[offset + 1] = (value >>> 16)
	    this[offset + 2] = (value >>> 8)
	    this[offset + 3] = (value & 0xff)
	  } else {
	    objectWriteUInt32(this, value, offset, false)
	  }
	  return offset + 4
	}

	function checkIEEE754 (buf, value, offset, ext, max, min) {
	  if (value > max || value < min) throw new RangeError('value is out of bounds')
	  if (offset + ext > buf.length) throw new RangeError('index out of range')
	  if (offset < 0) throw new RangeError('index out of range')
	}

	function writeFloat (buf, value, offset, littleEndian, noAssert) {
	  if (!noAssert) {
	    checkIEEE754(buf, value, offset, 4, 3.4028234663852886e+38, -3.4028234663852886e+38)
	  }
	  ieee754.write(buf, value, offset, littleEndian, 23, 4)
	  return offset + 4
	}

	Buffer.prototype.writeFloatLE = function writeFloatLE (value, offset, noAssert) {
	  return writeFloat(this, value, offset, true, noAssert)
	}

	Buffer.prototype.writeFloatBE = function writeFloatBE (value, offset, noAssert) {
	  return writeFloat(this, value, offset, false, noAssert)
	}

	function writeDouble (buf, value, offset, littleEndian, noAssert) {
	  if (!noAssert) {
	    checkIEEE754(buf, value, offset, 8, 1.7976931348623157E+308, -1.7976931348623157E+308)
	  }
	  ieee754.write(buf, value, offset, littleEndian, 52, 8)
	  return offset + 8
	}

	Buffer.prototype.writeDoubleLE = function writeDoubleLE (value, offset, noAssert) {
	  return writeDouble(this, value, offset, true, noAssert)
	}

	Buffer.prototype.writeDoubleBE = function writeDoubleBE (value, offset, noAssert) {
	  return writeDouble(this, value, offset, false, noAssert)
	}

	// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
	Buffer.prototype.copy = function copy (target, targetStart, start, end) {
	  if (!start) start = 0
	  if (!end && end !== 0) end = this.length
	  if (targetStart >= target.length) targetStart = target.length
	  if (!targetStart) targetStart = 0
	  if (end > 0 && end < start) end = start

	  // Copy 0 bytes; we're done
	  if (end === start) return 0
	  if (target.length === 0 || this.length === 0) return 0

	  // Fatal error conditions
	  if (targetStart < 0) {
	    throw new RangeError('targetStart out of bounds')
	  }
	  if (start < 0 || start >= this.length) throw new RangeError('sourceStart out of bounds')
	  if (end < 0) throw new RangeError('sourceEnd out of bounds')

	  // Are we oob?
	  if (end > this.length) end = this.length
	  if (target.length - targetStart < end - start) {
	    end = target.length - targetStart + start
	  }

	  var len = end - start
	  var i

	  if (this === target && start < targetStart && targetStart < end) {
	    // descending copy from end
	    for (i = len - 1; i >= 0; i--) {
	      target[i + targetStart] = this[i + start]
	    }
	  } else if (len < 1000 || !Buffer.TYPED_ARRAY_SUPPORT) {
	    // ascending copy from start
	    for (i = 0; i < len; i++) {
	      target[i + targetStart] = this[i + start]
	    }
	  } else {
	    target._set(this.subarray(start, start + len), targetStart)
	  }

	  return len
	}

	// fill(value, start=0, end=buffer.length)
	Buffer.prototype.fill = function fill (value, start, end) {
	  if (!value) value = 0
	  if (!start) start = 0
	  if (!end) end = this.length

	  if (end < start) throw new RangeError('end < start')

	  // Fill 0 bytes; we're done
	  if (end === start) return
	  if (this.length === 0) return

	  if (start < 0 || start >= this.length) throw new RangeError('start out of bounds')
	  if (end < 0 || end > this.length) throw new RangeError('end out of bounds')

	  var i
	  if (typeof value === 'number') {
	    for (i = start; i < end; i++) {
	      this[i] = value
	    }
	  } else {
	    var bytes = utf8ToBytes(value.toString())
	    var len = bytes.length
	    for (i = start; i < end; i++) {
	      this[i] = bytes[i % len]
	    }
	  }

	  return this
	}

	/**
	 * Creates a new `ArrayBuffer` with the *copied* memory of the buffer instance.
	 * Added in Node 0.12. Only available in browsers that support ArrayBuffer.
	 */
	Buffer.prototype.toArrayBuffer = function toArrayBuffer () {
	  if (typeof Uint8Array !== 'undefined') {
	    if (Buffer.TYPED_ARRAY_SUPPORT) {
	      return (new Buffer(this)).buffer
	    } else {
	      var buf = new Uint8Array(this.length)
	      for (var i = 0, len = buf.length; i < len; i += 1) {
	        buf[i] = this[i]
	      }
	      return buf.buffer
	    }
	  } else {
	    throw new TypeError('Buffer.toArrayBuffer not supported in this browser')
	  }
	}

	// HELPER FUNCTIONS
	// ================

	var BP = Buffer.prototype

	/**
	 * Augment a Uint8Array *instance* (not the Uint8Array class!) with Buffer methods
	 */
	Buffer._augment = function _augment (arr) {
	  arr.constructor = Buffer
	  arr._isBuffer = true

	  // save reference to original Uint8Array set method before overwriting
	  arr._set = arr.set

	  // deprecated
	  arr.get = BP.get
	  arr.set = BP.set

	  arr.write = BP.write
	  arr.toString = BP.toString
	  arr.toLocaleString = BP.toString
	  arr.toJSON = BP.toJSON
	  arr.equals = BP.equals
	  arr.compare = BP.compare
	  arr.indexOf = BP.indexOf
	  arr.copy = BP.copy
	  arr.slice = BP.slice
	  arr.readUIntLE = BP.readUIntLE
	  arr.readUIntBE = BP.readUIntBE
	  arr.readUInt8 = BP.readUInt8
	  arr.readUInt16LE = BP.readUInt16LE
	  arr.readUInt16BE = BP.readUInt16BE
	  arr.readUInt32LE = BP.readUInt32LE
	  arr.readUInt32BE = BP.readUInt32BE
	  arr.readIntLE = BP.readIntLE
	  arr.readIntBE = BP.readIntBE
	  arr.readInt8 = BP.readInt8
	  arr.readInt16LE = BP.readInt16LE
	  arr.readInt16BE = BP.readInt16BE
	  arr.readInt32LE = BP.readInt32LE
	  arr.readInt32BE = BP.readInt32BE
	  arr.readFloatLE = BP.readFloatLE
	  arr.readFloatBE = BP.readFloatBE
	  arr.readDoubleLE = BP.readDoubleLE
	  arr.readDoubleBE = BP.readDoubleBE
	  arr.writeUInt8 = BP.writeUInt8
	  arr.writeUIntLE = BP.writeUIntLE
	  arr.writeUIntBE = BP.writeUIntBE
	  arr.writeUInt16LE = BP.writeUInt16LE
	  arr.writeUInt16BE = BP.writeUInt16BE
	  arr.writeUInt32LE = BP.writeUInt32LE
	  arr.writeUInt32BE = BP.writeUInt32BE
	  arr.writeIntLE = BP.writeIntLE
	  arr.writeIntBE = BP.writeIntBE
	  arr.writeInt8 = BP.writeInt8
	  arr.writeInt16LE = BP.writeInt16LE
	  arr.writeInt16BE = BP.writeInt16BE
	  arr.writeInt32LE = BP.writeInt32LE
	  arr.writeInt32BE = BP.writeInt32BE
	  arr.writeFloatLE = BP.writeFloatLE
	  arr.writeFloatBE = BP.writeFloatBE
	  arr.writeDoubleLE = BP.writeDoubleLE
	  arr.writeDoubleBE = BP.writeDoubleBE
	  arr.fill = BP.fill
	  arr.inspect = BP.inspect
	  arr.toArrayBuffer = BP.toArrayBuffer

	  return arr
	}

	var INVALID_BASE64_RE = /[^+\/0-9A-Za-z-_]/g

	function base64clean (str) {
	  // Node strips out invalid characters like \n and \t from the string, base64-js does not
	  str = stringtrim(str).replace(INVALID_BASE64_RE, '')
	  // Node converts strings with length < 2 to ''
	  if (str.length < 2) return ''
	  // Node allows for non-padded base64 strings (missing trailing ===), base64-js does not
	  while (str.length % 4 !== 0) {
	    str = str + '='
	  }
	  return str
	}

	function stringtrim (str) {
	  if (str.trim) return str.trim()
	  return str.replace(/^\s+|\s+$/g, '')
	}

	function toHex (n) {
	  if (n < 16) return '0' + n.toString(16)
	  return n.toString(16)
	}

	function utf8ToBytes (string, units) {
	  units = units || Infinity
	  var codePoint
	  var length = string.length
	  var leadSurrogate = null
	  var bytes = []

	  for (var i = 0; i < length; i++) {
	    codePoint = string.charCodeAt(i)

	    // is surrogate component
	    if (codePoint > 0xD7FF && codePoint < 0xE000) {
	      // last char was a lead
	      if (!leadSurrogate) {
	        // no lead yet
	        if (codePoint > 0xDBFF) {
	          // unexpected trail
	          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
	          continue
	        } else if (i + 1 === length) {
	          // unpaired lead
	          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
	          continue
	        }

	        // valid lead
	        leadSurrogate = codePoint

	        continue
	      }

	      // 2 leads in a row
	      if (codePoint < 0xDC00) {
	        if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
	        leadSurrogate = codePoint
	        continue
	      }

	      // valid surrogate pair
	      codePoint = (leadSurrogate - 0xD800 << 10 | codePoint - 0xDC00) + 0x10000
	    } else if (leadSurrogate) {
	      // valid bmp char, but last char was a lead
	      if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
	    }

	    leadSurrogate = null

	    // encode utf8
	    if (codePoint < 0x80) {
	      if ((units -= 1) < 0) break
	      bytes.push(codePoint)
	    } else if (codePoint < 0x800) {
	      if ((units -= 2) < 0) break
	      bytes.push(
	        codePoint >> 0x6 | 0xC0,
	        codePoint & 0x3F | 0x80
	      )
	    } else if (codePoint < 0x10000) {
	      if ((units -= 3) < 0) break
	      bytes.push(
	        codePoint >> 0xC | 0xE0,
	        codePoint >> 0x6 & 0x3F | 0x80,
	        codePoint & 0x3F | 0x80
	      )
	    } else if (codePoint < 0x110000) {
	      if ((units -= 4) < 0) break
	      bytes.push(
	        codePoint >> 0x12 | 0xF0,
	        codePoint >> 0xC & 0x3F | 0x80,
	        codePoint >> 0x6 & 0x3F | 0x80,
	        codePoint & 0x3F | 0x80
	      )
	    } else {
	      throw new Error('Invalid code point')
	    }
	  }

	  return bytes
	}

	function asciiToBytes (str) {
	  var byteArray = []
	  for (var i = 0; i < str.length; i++) {
	    // Node's code seems to be doing this and not & 0x7F..
	    byteArray.push(str.charCodeAt(i) & 0xFF)
	  }
	  return byteArray
	}

	function utf16leToBytes (str, units) {
	  var c, hi, lo
	  var byteArray = []
	  for (var i = 0; i < str.length; i++) {
	    if ((units -= 2) < 0) break

	    c = str.charCodeAt(i)
	    hi = c >> 8
	    lo = c % 256
	    byteArray.push(lo)
	    byteArray.push(hi)
	  }

	  return byteArray
	}

	function base64ToBytes (str) {
	  return base64.toByteArray(base64clean(str))
	}

	function blitBuffer (src, dst, offset, length) {
	  for (var i = 0; i < length; i++) {
	    if ((i + offset >= dst.length) || (i >= src.length)) break
	    dst[i + offset] = src[i]
	  }
	  return i
	}

	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(126).Buffer, (function() { return this; }())))

/***/ },
/* 127 */
/***/ function(module, exports, __webpack_require__) {

	var lookup = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

	;(function (exports) {
		'use strict';

	  var Arr = (typeof Uint8Array !== 'undefined')
	    ? Uint8Array
	    : Array

		var PLUS   = '+'.charCodeAt(0)
		var SLASH  = '/'.charCodeAt(0)
		var NUMBER = '0'.charCodeAt(0)
		var LOWER  = 'a'.charCodeAt(0)
		var UPPER  = 'A'.charCodeAt(0)
		var PLUS_URL_SAFE = '-'.charCodeAt(0)
		var SLASH_URL_SAFE = '_'.charCodeAt(0)

		function decode (elt) {
			var code = elt.charCodeAt(0)
			if (code === PLUS ||
			    code === PLUS_URL_SAFE)
				return 62 // '+'
			if (code === SLASH ||
			    code === SLASH_URL_SAFE)
				return 63 // '/'
			if (code < NUMBER)
				return -1 //no match
			if (code < NUMBER + 10)
				return code - NUMBER + 26 + 26
			if (code < UPPER + 26)
				return code - UPPER
			if (code < LOWER + 26)
				return code - LOWER + 26
		}

		function b64ToByteArray (b64) {
			var i, j, l, tmp, placeHolders, arr

			if (b64.length % 4 > 0) {
				throw new Error('Invalid string. Length must be a multiple of 4')
			}

			// the number of equal signs (place holders)
			// if there are two placeholders, than the two characters before it
			// represent one byte
			// if there is only one, then the three characters before it represent 2 bytes
			// this is just a cheap hack to not do indexOf twice
			var len = b64.length
			placeHolders = '=' === b64.charAt(len - 2) ? 2 : '=' === b64.charAt(len - 1) ? 1 : 0

			// base64 is 4/3 + up to two characters of the original data
			arr = new Arr(b64.length * 3 / 4 - placeHolders)

			// if there are placeholders, only get up to the last complete 4 chars
			l = placeHolders > 0 ? b64.length - 4 : b64.length

			var L = 0

			function push (v) {
				arr[L++] = v
			}

			for (i = 0, j = 0; i < l; i += 4, j += 3) {
				tmp = (decode(b64.charAt(i)) << 18) | (decode(b64.charAt(i + 1)) << 12) | (decode(b64.charAt(i + 2)) << 6) | decode(b64.charAt(i + 3))
				push((tmp & 0xFF0000) >> 16)
				push((tmp & 0xFF00) >> 8)
				push(tmp & 0xFF)
			}

			if (placeHolders === 2) {
				tmp = (decode(b64.charAt(i)) << 2) | (decode(b64.charAt(i + 1)) >> 4)
				push(tmp & 0xFF)
			} else if (placeHolders === 1) {
				tmp = (decode(b64.charAt(i)) << 10) | (decode(b64.charAt(i + 1)) << 4) | (decode(b64.charAt(i + 2)) >> 2)
				push((tmp >> 8) & 0xFF)
				push(tmp & 0xFF)
			}

			return arr
		}

		function uint8ToBase64 (uint8) {
			var i,
				extraBytes = uint8.length % 3, // if we have 1 byte left, pad 2 bytes
				output = "",
				temp, length

			function encode (num) {
				return lookup.charAt(num)
			}

			function tripletToBase64 (num) {
				return encode(num >> 18 & 0x3F) + encode(num >> 12 & 0x3F) + encode(num >> 6 & 0x3F) + encode(num & 0x3F)
			}

			// go through the array every three bytes, we'll deal with trailing stuff later
			for (i = 0, length = uint8.length - extraBytes; i < length; i += 3) {
				temp = (uint8[i] << 16) + (uint8[i + 1] << 8) + (uint8[i + 2])
				output += tripletToBase64(temp)
			}

			// pad the end with zeros, but make sure to not forget the extra bytes
			switch (extraBytes) {
				case 1:
					temp = uint8[uint8.length - 1]
					output += encode(temp >> 2)
					output += encode((temp << 4) & 0x3F)
					output += '=='
					break
				case 2:
					temp = (uint8[uint8.length - 2] << 8) + (uint8[uint8.length - 1])
					output += encode(temp >> 10)
					output += encode((temp >> 4) & 0x3F)
					output += encode((temp << 2) & 0x3F)
					output += '='
					break
			}

			return output
		}

		exports.toByteArray = b64ToByteArray
		exports.fromByteArray = uint8ToBase64
	}( false ? (this.base64js = {}) : exports))


/***/ },
/* 128 */
/***/ function(module, exports) {

	exports.read = function (buffer, offset, isLE, mLen, nBytes) {
	  var e, m
	  var eLen = nBytes * 8 - mLen - 1
	  var eMax = (1 << eLen) - 1
	  var eBias = eMax >> 1
	  var nBits = -7
	  var i = isLE ? (nBytes - 1) : 0
	  var d = isLE ? -1 : 1
	  var s = buffer[offset + i]

	  i += d

	  e = s & ((1 << (-nBits)) - 1)
	  s >>= (-nBits)
	  nBits += eLen
	  for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8) {}

	  m = e & ((1 << (-nBits)) - 1)
	  e >>= (-nBits)
	  nBits += mLen
	  for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8) {}

	  if (e === 0) {
	    e = 1 - eBias
	  } else if (e === eMax) {
	    return m ? NaN : ((s ? -1 : 1) * Infinity)
	  } else {
	    m = m + Math.pow(2, mLen)
	    e = e - eBias
	  }
	  return (s ? -1 : 1) * m * Math.pow(2, e - mLen)
	}

	exports.write = function (buffer, value, offset, isLE, mLen, nBytes) {
	  var e, m, c
	  var eLen = nBytes * 8 - mLen - 1
	  var eMax = (1 << eLen) - 1
	  var eBias = eMax >> 1
	  var rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0)
	  var i = isLE ? 0 : (nBytes - 1)
	  var d = isLE ? 1 : -1
	  var s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0

	  value = Math.abs(value)

	  if (isNaN(value) || value === Infinity) {
	    m = isNaN(value) ? 1 : 0
	    e = eMax
	  } else {
	    e = Math.floor(Math.log(value) / Math.LN2)
	    if (value * (c = Math.pow(2, -e)) < 1) {
	      e--
	      c *= 2
	    }
	    if (e + eBias >= 1) {
	      value += rt / c
	    } else {
	      value += rt * Math.pow(2, 1 - eBias)
	    }
	    if (value * c >= 2) {
	      e++
	      c /= 2
	    }

	    if (e + eBias >= eMax) {
	      m = 0
	      e = eMax
	    } else if (e + eBias >= 1) {
	      m = (value * c - 1) * Math.pow(2, mLen)
	      e = e + eBias
	    } else {
	      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen)
	      e = 0
	    }
	  }

	  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8) {}

	  e = (e << mLen) | m
	  eLen += mLen
	  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8) {}

	  buffer[offset + i - d] |= s * 128
	}


/***/ },
/* 129 */
/***/ function(module, exports) {

	var toString = {}.toString;

	module.exports = Array.isArray || function (arr) {
	  return toString.call(arr) == '[object Array]';
	};


/***/ },
/* 130 */
/***/ function(module, exports) {

	'use strict';

	module.exports = function asArray(x) {
	    if (!x) {
	        x = [];
	    }

	    if (!Array.isArray(x)) {
	        x = [x];
	    }

	    return x;
	};

/***/ },
/* 131 */
/***/ function(module, exports) {

	'use strict';

	function findIndexBy(arr, fn) {

	    var i = 0;
	    var len = arr.length;

	    for (; i < len; i++) {
	        if (fn(arr[i]) === true) {
	            return i;
	        }
	    }

	    return -1;
	}

	module.exports = findIndexBy;

/***/ },
/* 132 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var findIndexBy = __webpack_require__(131);

	function findIndexByName(arr, name) {
	    return findIndexBy(arr, function (info) {
	        return info.name === name;
	    });
	}

	module.exports = findIndexByName;

/***/ },
/* 133 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var React = __webpack_require__(6);
	var assign = __webpack_require__(7);
	var normalize = __webpack_require__(21);

	var TEXT_ALIGN_2_JUSTIFY = {
	    right: 'flex-end',
	    center: 'center'
	};

	function copyProps(target, source, list) {

	    list.forEach(function (name) {
	        if (name in source) {
	            target[name] = source[name];
	        }
	    });
	}

	var PropTypes = React.PropTypes;

	var Cell = React.createClass({

	    displayName: 'ReactDataGrid.Cell',

	    propTypes: {
	        className: PropTypes.string,
	        firstClassName: PropTypes.string,
	        lastClassName: PropTypes.string,

	        contentPadding: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),

	        column: PropTypes.object,
	        columns: PropTypes.array,
	        index: PropTypes.number,

	        style: PropTypes.object,
	        text: PropTypes.any,
	        rowIndex: PropTypes.number
	    },

	    getDefaultProps: function getDefaultProps() {
	        return {
	            text: '',

	            firstClassName: 'z-first',
	            lastClassName: 'z-last',

	            defaultStyle: {}
	        };
	    },

	    prepareClassName: function prepareClassName(props) {
	        var index = props.index;
	        var columns = props.columns;
	        var column = props.column;

	        var textAlign = column && column.textAlign;

	        var className = props.className || '';

	        className += ' ' + Cell.className;

	        if (columns) {
	            if (!index && props.firstClassName) {
	                className += ' ' + props.firstClassName;
	            }

	            if (index == columns.length - 1 && props.lastClassName) {
	                className += ' ' + props.lastClassName;
	            }
	        }

	        if (textAlign) {
	            className += ' z-align-' + textAlign;
	        }

	        return className;
	    },

	    prepareStyle: function prepareStyle(props) {
	        var column = props.column;
	        var sizeStyle = column && column.sizeStyle;

	        var alignStyle;
	        var textAlign = column && column.textAlign || (props.style || {}).textAlign;

	        if (textAlign) {
	            alignStyle = { justifyContent: TEXT_ALIGN_2_JUSTIFY[textAlign] };
	        }

	        var style = assign({}, props.defaultStyle, sizeStyle, alignStyle, props.style);

	        return normalize(style);
	    },

	    prepareProps: function prepareProps(thisProps) {

	        var props = assign({}, thisProps);

	        if (!props.column && props.columns) {
	            props.column = props.columns[props.index];
	        }

	        props.className = this.prepareClassName(props);
	        props.style = this.prepareStyle(props);

	        return props;
	    },

	    render: function render() {
	        var props = this.p = this.prepareProps(this.props);

	        var column = props.column;
	        var textAlign = column && column.textAlign;
	        var text = props.renderText ? props.renderText(props.text, column, props.rowIndex) : props.text;

	        var contentProps = {
	            className: 'z-content',
	            style: {
	                padding: props.contentPadding
	            }
	        };

	        var content = props.renderCell ? props.renderCell(contentProps, text, props) : React.DOM.div(contentProps, text);

	        var renderProps = assign({}, props);

	        delete renderProps.data;

	        return React.createElement(
	            'div',
	            renderProps,
	            content,
	            props.children
	        );
	    }
	});

	Cell.className = 'z-cell';

	module.exports = Cell;

/***/ },
/* 134 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var Region = __webpack_require__(10);
	var DragHelper = __webpack_require__(86);

	function range(start, end) {
	    var res = [];

	    for (; start <= end; start++) {
	        res.push(start);
	    }

	    return res;
	}

	function buildIndexes(direction, index, dragIndex) {
	    var indexes = direction < 0 ? range(index, dragIndex) : range(dragIndex, index);

	    var result = {};

	    indexes.forEach(function (value) {
	        result[value] = true;
	    });

	    return result;
	}

	module.exports = function (header, props, column, event) {

	    event.preventDefault();

	    var headerNode = header.getDOMNode();
	    var headerRegion = Region.from(headerNode);
	    var dragColumn = column;
	    var dragColumnIndex;
	    var columnData;
	    var shiftRegion;

	    DragHelper(event, {

	        constrainTo: headerRegion.expand({ top: true, bottom: true }),

	        onDragStart: function onDragStart(event, config) {

	            var columnHeaders = headerNode.querySelectorAll('.' + props.cellClassName);

	            columnData = props.columns.map(function (column, i) {
	                var region = Region.from(columnHeaders[i]);

	                if (column === dragColumn) {
	                    dragColumnIndex = i;
	                    shiftRegion = region.clone();
	                }

	                return {
	                    column: column,
	                    index: i,
	                    region: region
	                };
	            });

	            header.setState({
	                dragColumn: column,
	                dragging: true
	            });

	            config.columnData = columnData;
	        },
	        onDrag: function onDrag(event, config) {
	            var diff = config.diff.left;
	            var directionSign = diff < 0 ? -1 : 1;
	            var state = {
	                dragColumnIndex: dragColumnIndex,
	                dragColumn: dragColumn,
	                dragLeft: diff,
	                dropIndex: null,
	                shiftIndexes: null,
	                shiftSize: null
	            };

	            var shift;
	            var shiftSize;
	            var newLeft = shiftRegion.left + diff;
	            var newRight = newLeft + shiftRegion.width;
	            var shiftZone = { left: newLeft, right: newRight };

	            config.columnData.forEach(function (columnData, index, arr) {

	                var itColumn = columnData.column;
	                var itRegion = columnData.region;

	                if (shift || itColumn === dragColumn) {
	                    return;
	                }

	                var itLeft = itRegion.left;
	                var itRight = itRegion.right;
	                var itZone = directionSign == -1 ? { left: itLeft, right: itLeft + itRegion.width } : { left: itRight - itRegion.width, right: itRight };

	                if (shiftRegion.width < itRegion.width) {
	                    //shift region is smaller than itRegion
	                    shift = Region.getIntersectionWidth(itZone, shiftZone) >= Math.min(itRegion.width, shiftRegion.width) / 2;
	                } else {
	                    //shift region is bigger than itRegion
	                    shift = Region.getIntersectionWidth(itRegion, shiftZone) >= itRegion.width / 2;
	                }

	                if (shift) {
	                    shiftSize = -directionSign * shiftRegion.width;
	                    state.dropIndex = index;
	                    state.shiftIndexes = buildIndexes(directionSign, index, dragColumnIndex);
	                    state.shiftSize = shiftSize;
	                }
	            });

	            header.setState(state);
	        },

	        onDrop: function onDrop(event) {
	            header.onDrop(event);
	        }
	    });
	};

/***/ },
/* 135 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var Region = __webpack_require__(10);
	var DragHelper = __webpack_require__(86);

	var findIndexByName = __webpack_require__(132);

	module.exports = function (header, props, column, event) {

	    event.preventDefault();

	    var columns = props.columns;
	    var index = findIndexByName(columns, column.name);
	    var proxyLeft = Region.from(event.target).right;

	    var headerNode = header.getDOMNode();

	    var constrainTo = Region.from(headerNode);

	    DragHelper(event, {
	        constrainTo: constrainTo,

	        onDragStart: function onDragStart(event, config) {

	            header.onResizeDragStart({
	                resizing: true,
	                resizeColumn: column,
	                resizeProxyLeft: proxyLeft
	            });
	        },

	        onDrag: function onDrag(event, config) {
	            var diff = config.diff.left;

	            header.onResizeDrag({
	                resizeProxyDiff: diff
	            });
	        },

	        onDrop: function onDrop(event, config) {

	            var diff = config.diff.left;
	            var columnHeaders = headerNode.querySelectorAll('.' + props.cellClassName);
	            var nextColumn = diff > 0 ? null : columns[index + 1];

	            var columnSize = Region.from(columnHeaders[index]).width;
	            var nextColumnSize;
	            var firstSize = columnSize + diff;
	            var secondSize = 0;

	            // if (firstSize < column.minWidth){
	            //     firstSize = column.minWidth
	            //     diff = firstSize - columnSize
	            // }

	            if (nextColumn) {
	                nextColumnSize = nextColumn ? Region.from(columnHeaders[index + 1]).width : 0;

	                secondSize = nextColumnSize - diff;
	            }

	            // if (nextColumn && secondSize < nextColumn.minWidth){
	            //     secondSize = nextColumn.minWidth
	            //     diff = nextColumnSize - secondSize
	            //     firstSize = columnSize + diff
	            // }

	            var resizeInfo = [{
	                name: column.name,
	                size: firstSize,
	                diff: diff
	            }];

	            if (nextColumn) {
	                resizeInfo.push({
	                    name: nextColumn.name,
	                    size: secondSize,
	                    diff: -diff
	                });
	            }

	            header.onResizeDrop({
	                resizing: false,
	                resizeColumn: null,
	                resizeProxyLeft: null
	            }, resizeInfo, event);
	        }
	    });
	};

/***/ },
/* 136 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var React = __webpack_require__(6);
	var assign = __webpack_require__(7);

	module.exports = React.createClass({

	    displayName: 'ReactDataGrid.ResizeProxy',

	    propTypes: {
	        active: React.PropTypes.bool
	    },

	    getInitialState: function getInitialState() {
	        return {
	            offset: 0
	        };
	    },

	    render: function render() {

	        var props = assign({}, this.props);
	        var state = this.state;

	        var style = {};
	        var active = props.active;

	        if (active) {
	            style.display = 'block';
	            style.left = state.offset;
	        }

	        return React.createElement('div', { className: 'z-resize-proxy', style: style });
	    }
	});

/***/ },
/* 137 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var hasown = __webpack_require__(12);

	function copyIf(source, target) {
	    var hasOwn = hasown(target);

	    Object.keys(source).forEach(function (key) {
	        if (!hasOwn(key)) {
	            target[key] = source[key];
	        }
	    });
	}

	function groupByFields(data, fields, path, names, fieldIndex) {
	    data = data || [];
	    fieldIndex = fieldIndex || 0;

	    var field = fields[fieldIndex];

	    if (!field) {
	        return data;
	    }

	    var group = groupArrayByField(data, field);
	    var fieldName = typeof field == 'string' ? field : field.name;

	    if (!fieldIndex) {
	        group.namePath = [];
	        group.valuePath = [];
	        group.depth = 0;
	        delete group.name;
	    }

	    var groupsCount = group.length;

	    if (group.keys && group.keys.length) {

	        group.leaf = false;
	        group.keys.forEach(function (key) {

	            var groupPath = (path || []).concat(key);
	            var fieldNames = (names || []).concat(fieldName);
	            var data = groupByFields(group.data[key], fields, groupPath, fieldNames, fieldIndex + 1);

	            if (Array.isArray(data)) {
	                data = {
	                    data: data,
	                    leaf: true
	                };
	            }

	            data.name = fieldName;
	            data.value = key;
	            data.valuePath = groupPath;
	            data.namePath = fieldNames;
	            data.depth = fieldIndex + 1;

	            if (typeof field != 'string') {

	                copyIf(field, data);
	            }

	            group.data[key] = data;

	            if (!data.leaf) {
	                groupsCount += data.groupsCount;
	            }
	        });
	    }

	    if (!group.leaf) {
	        group.groupsCount = groupsCount;
	    }

	    return group;
	}

	function groupArrayByField(data, field) {

	    var groupKeys = {};
	    var groupKeysArray = [];

	    var fieldName = typeof field == 'string' ? field : field.name;(data || []).forEach(function (item) {
	        var itemKey = item[fieldName];

	        if (groupKeys[itemKey]) {
	            groupKeys[itemKey].push(item);
	        } else {
	            groupKeys[itemKey] = [item];
	            groupKeysArray.push(itemKey);
	        }
	    });

	    var result = {
	        keys: groupKeysArray,
	        data: groupKeys,
	        childName: fieldName,
	        length: groupKeysArray.length,
	        leaf: true
	    };

	    return result;
	}

	module.exports = groupByFields;

/***/ },
/* 138 */
/***/ function(module, exports) {

	'use strict';

	function slice(data, props) {

	    if (!props.virtualRendering) {
	        return data;
	    }

	    return data.slice(props.startIndex, props.startIndex + props.renderCount);
	}

	module.exports = slice;

/***/ },
/* 139 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var React = __webpack_require__(6);
	var renderMenu = __webpack_require__(140);
	var renderRow = __webpack_require__(141);
	var tableStyle = __webpack_require__(143);
	var slice = __webpack_require__(138);
	var LoadMask = __webpack_require__(8);

	function getData(props) {

	    if (!props.virtualRendering) {
	        return props.data;
	    }

	    return slice(props.data, props);
	}

	module.exports = function (props, rows) {

	    rows = rows || getData(props).map(function (data, index) {
	        return renderRow.call(this, props, data, index + props.startIndex);
	    }, this);

	    // if (props.topLoader && props.scrollTop < (2 * props.rowHeight)){
	    // rows.unshift(props.topLoader)
	    // }

	    return {
	        className: 'z-table',
	        style: tableStyle(props),
	        children: rows
	    };
	};

/***/ },
/* 140 */
/***/ function(module, exports) {

	'use strict';

	module.exports = function renderMenu(props) {
	    if (!props.menu) {
	        return;
	    }

	    return props.menu({
	        className: 'z-header-menu-column',
	        gridColumns: props.columns
	    });
	};

/***/ },
/* 141 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var assign = __webpack_require__(7);
	var React = __webpack_require__(6);

	var Row = __webpack_require__(142);
	var RowFactory = React.createFactory(Row);

	var renderCell = Row.prototype.renderCell;

	/**
	 * Render a datagrid row
	 *
	 * @param  {Object}   props The props from which to build row props
	 * @param  {Object}   data The data object that backs this row
	 * @param  {Number}   index The index in the grid of the row to be rendered
	 * @param  {Function} [fn] A function that can be used to modify built row props
	 *
	 * If props.rowFactory is specified, it will be used to build the ReactElement
	 * corresponding to this row. In case it returns undefined, the default RowFactory will be used
	 * (this case occurs when the rowFactory was specified just to modify the row props)
	 *
	 * @return {ReactElement}
	 */
	module.exports = function renderRow(props, data, index, fn) {
	    var factory = props.rowFactory || RowFactory;
	    var key = data[props.idProperty];
	    var selectedKey = key;
	    var renderKey = key;

	    if (!props.groupBy) {
	        renderKey = index - props.startIndex;
	    }

	    var selected = false;

	    if (typeof props.selected == 'object' && props.selected) {
	        selected = !!props.selected[selectedKey];
	    } else if (props.selected) {
	        selected = selectedKey === props.selected;
	    }

	    var config = assign({}, props.rowProps, {
	        selected: selected,

	        key: renderKey,
	        data: data,
	        index: index,

	        cellFactory: props.cellFactory,
	        renderCell: props.renderCell,
	        renderText: props.renderText,
	        cellPadding: props.cellPadding,
	        rowHeight: props.rowHeight,
	        minWidth: props.minRowWidth - props.scrollbarSize,
	        columns: props.columns,

	        rowContextMenu: props.rowContextMenu,
	        showMenu: props.showMenu,

	        _onClick: this ? this.handleRowClick : null
	    });

	    var style;
	    var rowStyle = props.rowStyle;

	    if (rowStyle) {
	        style = {};

	        if (typeof rowStyle == 'function') {
	            style = rowStyle(data, config);
	        } else {
	            assign(style, rowStyle);
	        }

	        config.style = style;
	    }

	    var className = props.rowClassName;

	    if (typeof className == 'function') {
	        className = className(data, config);
	    }

	    if (className) {
	        config.className = className;
	    }

	    if (typeof fn == 'function') {
	        config = fn(config);
	    }

	    var row = factory(config);

	    if (row === undefined) {
	        row = RowFactory(config);
	    }

	    if (config.selected && this) {
	        this.selIndex = index;
	    }

	    // var cached = this.rowCache && this.rowCache[renderKey]

	    // if (cached){
	    // return React.cloneElement(cached, {
	    //     children: config.columns.map(function(col, index){
	    //         return renderCell(config, col, index)
	    //     })
	    // })
	    // }

	    // if (this.rowCache){
	    //     this.rowCache[renderKey] = row
	    // }

	    return row;
	};

/***/ },
/* 142 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var React = __webpack_require__(6);
	var Region = __webpack_require__(10);
	var assign = __webpack_require__(7);
	var normalize = __webpack_require__(21);
	var Cell = __webpack_require__(133);
	var CellFactory = React.createFactory(Cell);
	var ReactMenu = __webpack_require__(96);
	var ReactMenuFactory = React.createFactory(ReactMenu);

	module.exports = React.createClass({

	  displayName: 'ReactDataGrid.Row',

	  propTypes: {
	    data: React.PropTypes.object,
	    columns: React.PropTypes.array,
	    index: React.PropTypes.number
	  },

	  getDefaultProps: function getDefaultProps() {

	    return {
	      defaultStyle: {}
	    };
	  },

	  getInitialState: function getInitialState() {
	    return {
	      mouseOver: false
	    };
	  },

	  render: function render() {
	    var props = this.prepareProps(this.props);
	    var cells = props.children || props.columns.map(this.renderCell.bind(this, this.props));

	    return React.createElement(
	      'div',
	      props,
	      cells
	    );
	  },

	  prepareProps: function prepareProps(thisProps) {
	    var props = assign({}, thisProps);

	    props.className = this.prepareClassName(props, this.state);
	    props.style = this.prepareStyle(props);

	    props.onMouseEnter = this.handleMouseEnter;
	    props.onMouseLeave = this.handleMouseLeave;
	    props.onContextMenu = this.handleContextMenu;
	    props.onClick = this.handleRowClick;

	    delete props.data;
	    delete props.cellPadding;

	    return props;
	  },

	  handleRowClick: function handleRowClick(event) {

	    if (this.props.onClick) {
	      this.props.onClick(event);
	    }

	    if (this.props._onClick) {
	      this.props._onClick(this.props, event);
	    }
	  },

	  handleContextMenu: function handleContextMenu(event) {

	    if (this.props.rowContextMenu) {
	      this.showMenu(event);
	    }

	    if (this.props.onContextMenu) {
	      this.props.onContextMenu(event);
	    }
	  },

	  showMenu: function showMenu(event) {
	    var factory = this.props.rowContextMenu;
	    var alignTo = Region.from(event);

	    var props = {
	      style: {
	        position: 'absolute'
	      },
	      rowProps: this.props,
	      data: this.props.data,
	      alignTo: alignTo,
	      alignPositions: ['tl-bl', 'tr-br', 'bl-tl', 'br-tr'],
	      items: [{
	        label: 'stop'
	      }]
	    };

	    var menu = factory(props);

	    if (menu === undefined) {
	      menu = ReactMenuFactory(props);
	    }

	    event.preventDefault();

	    this.props.showMenu(function () {
	      return menu;
	    });
	  },

	  handleMouseLeave: function handleMouseLeave(event) {
	    this.setState({
	      mouseOver: false
	    });

	    if (this.props.onMouseLeave) {
	      this.props.onMouseLeave(event);
	    }
	  },

	  handleMouseEnter: function handleMouseEnter(event) {
	    this.setState({
	      mouseOver: true
	    });

	    if (this.props.onMouseEnter) {
	      this.props.onMouseEnter(event);
	    }
	  },

	  renderCell: function renderCell(props, column, index) {

	    var text = props.data[column.name];
	    var columns = props.columns;

	    var cellProps = {
	      style: column.style,
	      className: column.className,

	      key: column.name,
	      name: column.name,

	      data: props.data,
	      columns: columns,
	      index: index,
	      rowIndex: props.index,
	      textPadding: props.cellPadding,
	      renderCell: props.renderCell,
	      renderText: props.renderText
	    };

	    if (typeof column.render == 'function') {
	      text = column.render(text, props.data, cellProps);
	    }

	    cellProps.text = text;

	    var result;

	    if (props.cellFactory) {
	      result = props.cellFactory(cellProps);
	    }

	    if (result === undefined) {
	      result = CellFactory(cellProps);
	    }

	    return result;
	  },

	  prepareClassName: function prepareClassName(props, state) {
	    var className = props.className || '';

	    className += ' z-row ';

	    if (props.index % 2 === 0) {
	      className += ' z-even ' + (props.evenClassName || '');
	    } else {
	      className += ' z-odd ' + (props.oddClassName || '');
	    }

	    if (state.mouseOver) {
	      className += ' z-over ' + (props.overClassName || '');
	    }

	    if (props.selected) {
	      className += ' z-selected ' + (props.selectedClassName || '');
	    }

	    return className;
	  },

	  prepareStyle: function prepareStyle(props) {

	    var style = assign({}, props.defaultStyle, props.style);

	    style.height = props.rowHeight;
	    style.minWidth = props.minWidth;

	    return style;
	  }
	});

/***/ },
/* 143 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var normalize = __webpack_require__(21);

	var colors = ['blue', 'red', 'magenta'];
	module.exports = function (props) {
	    var scrollTop = props.virtualRendering ? -(props.topOffset || 0) : props.scrollTop;

	    return normalize({
	        transform: 'translate3d(' + -props.scrollLeft + 'px, ' + -scrollTop + 'px, 0px)'
	    });
	};

/***/ },
/* 144 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var React = __webpack_require__(6);

	var Row = __webpack_require__(142);
	var Cell = __webpack_require__(133);
	var CellFactory = React.createFactory(Cell);

	var renderRow = __webpack_require__(141);

	function renderData(props, data, depth) {

	    return data.map(function (data, index) {

	        return renderRow(props, data, index, function (config) {
	            config.cellFactory = function (cellProps) {
	                if (cellProps.index === 0) {
	                    cellProps.style.paddingLeft = depth * props.groupNestingWidth;
	                }

	                return CellFactory(cellProps);
	            };

	            config.className += ' z-grouped';

	            return config;
	        });
	    });
	}

	function renderGroupRow(props, groupData) {

	    var cellStyle = {
	        minWidth: props.totalColumnWidth,
	        paddingLeft: (groupData.depth - 1) * props.groupNestingWidth
	    };

	    return React.createElement(
	        Row,
	        { className: 'z-group-row', key: 'group-' + groupData.valuePath, rowHeight: props.rowHeight },
	        React.createElement(Cell, {
	            className: 'z-group-cell',
	            contentPadding: props.cellPadding,
	            text: groupData.value,
	            style: cellStyle
	        })
	    );
	}

	function renderGroup(props, groupData) {

	    var result = [renderGroupRow(props, groupData)];

	    if (groupData && groupData.leaf) {
	        result.push.apply(result, renderData(props, groupData.data, groupData.depth));
	    } else {
	        groupData.keys.forEach(function (key) {
	            var items = renderGroup(props, groupData.data[key]);
	            result.push.apply(result, items);
	        });
	    }

	    return result;
	}

	function renderGroups(props, groupsData) {
	    var result = [];

	    groupsData.keys.map(function (key) {
	        result.push.apply(result, renderGroup(props, groupsData.data[key]));
	    });

	    return result;
	}

	module.exports = function (props, groupData) {
	    return renderGroups(props, groupData);
	};

/***/ },
/* 145 */
/***/ function(module, exports) {

	"use strict";

	module.exports = function preventDefault(event) {
	    event.preventDefault();
	};

/***/ },
/* 146 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var assign = __webpack_require__(7);
	var getSelected = __webpack_require__(147);

	var hasOwn = function hasOwn(obj, prop) {
	    return Object.prototype.hasOwnProperty.call(obj, prop);
	};

	/**
	 * Here is how multi selection is implemented - trying to emulate behavior in OSX Finder
	 *
	 * When there is no selection, and an initial click for selection is done, keep that index (SELINDEX)
	 *
	 * Next, if we shift+click, we mark as selected the items from initial index to current click index.
	 *
	 * Now, if we ctrl+click elsewhere, keep the selection, but also add the selected file,
	 * and set SELINDEX to the new index. Now on any subsequent clicks, have the same behavior,
	 * selecting/deselecting items starting from SELINDEX to the new click index
	 */

	module.exports = {

	    findInitialSelectionIndex: function findInitialSelectionIndex() {
	        var selected = getSelected(this.p, this.state);
	        var index = undefined;

	        if (!Object.keys(selected).length) {
	            return index;
	        }

	        var i = 0;
	        var data = this.p.data;
	        var len = data.length;
	        var id;
	        var idProperty = this.props.idProperty;

	        for (; i < len; i++) {
	            id = data[i][idProperty];

	            if (selected[id]) {
	                index = i;
	            }
	        }

	        return index;
	    },

	    notifySelection: function notifySelection(selected, data) {
	        if (typeof this.props.onSelectionChange == 'function') {
	            this.props.onSelectionChange(selected, data);
	        }

	        if (!hasOwn(this.props, 'selected')) {
	            this.cleanCache();
	            this.setState({
	                defaultSelected: selected
	            });
	        }
	    },

	    handleSingleSelection: function handleSingleSelection(data, event) {
	        var props = this.p;

	        var rowSelected = this.isRowSelected(data);
	        var newSelected = !rowSelected;

	        var ctrlKey = event.metaKey || event.ctrlKey;
	        if (rowSelected && event && !ctrlKey) {
	            //if already selected and not ctrl, keep selected
	            newSelected = true;
	        }

	        var selectedId = newSelected ? data[props.idProperty] : null;

	        this.notifySelection(selectedId, data);
	    },

	    handleMultiSelection: function handleMultiSelection(data, event, config) {

	        var selIndex = config.selIndex;
	        var prevShiftKeyIndex = config.prevShiftKeyIndex;

	        var props = this.p;
	        var map = selIndex == null ? {} : assign({}, getSelected(props, this.state));

	        if (prevShiftKeyIndex != null && selIndex != null) {
	            var min = Math.min(prevShiftKeyIndex, selIndex);
	            var max = Math.max(prevShiftKeyIndex, selIndex);

	            var removeArray = props.data.slice(min, max + 1) || [];

	            removeArray.forEach(function (item) {
	                if (item) {
	                    var id = item[props.idProperty];
	                    delete map[id];
	                }
	            });
	        }

	        data.forEach(function (item) {
	            if (item) {
	                var id = item[props.idProperty];
	                map[id] = item;
	            }
	        });

	        this.notifySelection(map, data);
	    },

	    handleMultiSelectionRowToggle: function handleMultiSelectionRowToggle(data, event) {

	        var selected = getSelected(this.p, this.state);
	        var isSelected = this.isRowSelected(data);

	        var clone = assign({}, selected);
	        var id = data[this.p.idProperty];

	        if (isSelected) {
	            delete clone[id];
	        } else {
	            clone[id] = data;
	        }

	        this.notifySelection(clone, data);

	        return isSelected;
	    },

	    handleSelection: function handleSelection(rowProps, event) {

	        var props = this.p;

	        if (!hasOwn(props, 'selected') && !hasOwn(props, 'defaultSelected')) {
	            return;
	        }

	        var isSelected = this.isRowSelected(rowProps.data);
	        var multiSelect = this.isMultiSelect();

	        if (!multiSelect) {
	            this.handleSingleSelection(rowProps.data, event);
	            return;
	        }

	        if (this.selIndex === undefined) {
	            this.selIndex = this.findInitialSelectionIndex();
	        }

	        var selIndex = this.selIndex;

	        //multi selection
	        var index = rowProps.index;
	        var prevShiftKeyIndex = this.shiftKeyIndex;
	        var start;
	        var end;
	        var data;

	        if (event.metaKey || event.ctrlKey) {
	            this.selIndex = index;
	            this.shiftKeyIndex = null;

	            var unselect = this.handleMultiSelectionRowToggle(props.data[index], event);

	            if (unselect) {
	                this.selIndex++;
	                this.shiftKeyIndex = prevShiftKeyIndex;
	            }

	            return;
	        }

	        if (!event.shiftKey) {
	            //set selIndex, for future use
	            this.selIndex = index;
	            this.shiftKeyIndex = null;

	            //should not select many, so make selIndex null
	            selIndex = null;
	        } else {
	            this.shiftKeyIndex = index;
	        }

	        if (selIndex == null) {
	            data = [props.data[index]];
	        } else {
	            start = Math.min(index, selIndex);
	            end = Math.max(index, selIndex) + 1;
	            data = props.data.slice(start, end);
	        }

	        this.handleMultiSelection(data, event, {
	            selIndex: selIndex,
	            prevShiftKeyIndex: prevShiftKeyIndex
	        });
	    },

	    isRowSelected: function isRowSelected(data) {
	        var selectedMap = this.getSelectedMap();
	        var id = data[this.props.idProperty];

	        return selectedMap[id];
	    },

	    isMultiSelect: function isMultiSelect() {
	        var selected = getSelected(this.p, this.state);

	        return selected && typeof selected == 'object';
	    },

	    getSelectedMap: function getSelectedMap() {
	        var selected = getSelected(this.p, this.state);
	        var multiSelect = selected && typeof selected == 'object';
	        var map;

	        if (multiSelect) {
	            map = selected;
	        } else {
	            map = {};
	            map[selected] = true;
	        }

	        return map;
	    }
	};

/***/ },
/* 147 */
/***/ function(module, exports) {

	'use strict';

	module.exports = function (props, state) {
	                    var selected = props.selected == null ? state.defaultSelected : props.selected;

	                    return selected;
	};

/***/ },
/* 148 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var React = __webpack_require__(6);
	var assign = __webpack_require__(7);
	var ReactMenu = __webpack_require__(96);

	function stopPropagation(event) {
	    event.stopPropagation();
	}

	function emptyFn() {}

	var FILTER_FIELDS = {};

	module.exports = {

	    getColumnFilterFieldFactory: function getColumnFilterFieldFactory(column) {

	        var type = column.type || 'string';

	        return FILTER_FIELDS[type] || React.DOM.input;
	    },

	    getFilterField: function getFilterField(props) {
	        var column = props.column;
	        var filterValue = this.filterValues ? this.filterValues[column.name] : '';

	        var fieldProps = {
	            autoFocus: true,
	            defaultValue: filterValue,
	            column: column,
	            onChange: this.onFilterChange.bind(this, column),
	            onKeyUp: this.onFilterKeyUp.bind(this, column)
	        };

	        var fieldFactory = column.renderFilterField || this.props.renderFilterField;
	        var field;

	        if (fieldFactory) {
	            field = fieldFactory(fieldProps);
	        }

	        if (field === undefined) {
	            field = this.getColumnFilterFieldFactory(column)(fieldProps);
	        }

	        return field;
	    },

	    onFilterKeyUp: function onFilterKeyUp(column, event) {
	        if (event.key == 'Enter') {
	            this.onFilterClick(column, event);
	        }
	    },

	    onFilterChange: function onFilterChange(column, eventOrValue) {

	        var value = eventOrValue;

	        if (eventOrValue && eventOrValue.target) {
	            value = eventOrValue.target.value;
	        }

	        this.filterValues = this.filterValues || {};
	        this.filterValues[column.name] = value;

	        if (this.props.liveFilter) {
	            this.filterBy(column, value);
	        }
	    },

	    filterBy: function filterBy(column, value, event) {
	        ;(this.props.onFilter || emptyFn)(column, value, this.filterValues, event);
	    },

	    onFilterClick: function onFilterClick(column, event) {
	        this.showMenu(null);

	        var value = this.filterValues ? this.filterValues[column.name] : '';

	        this.filterBy(column, value, event);
	    },

	    onFilterClear: function onFilterClear(column) {
	        this.showMenu(null);

	        if (this.filterValues) {
	            this.filterValues[column.name] = '';
	        }

	        this.filterBy(column, '');(this.props.onClearFilter || emptyFn).apply(null, arguments);
	    },

	    getFilterButtons: function getFilterButtons(props) {

	        var column = props.column;
	        var factory = column.renderFilterButtons || this.props.renderFilterButtons;

	        var result;

	        if (factory) {
	            result = factory(props);
	        }

	        if (result !== undefined) {
	            return result;
	        }

	        var doFilter = this.onFilterClick.bind(this, column);
	        var doClear = this.onFilterClear.bind(this, column);

	        return React.createElement(
	            'div',
	            { style: { textAlign: 'center' } },
	            React.createElement(
	                'button',
	                { onClick: doFilter },
	                'Filter'
	            ),
	            React.createElement(
	                'button',
	                { onClick: doClear, style: { marginLeft: 5 } },
	                'Clear'
	            )
	        );
	    },

	    filterMenuFactory: function filterMenuFactory(props) {

	        var overStyle = {
	            background: 'white',
	            color: 'auto'
	        };

	        var column = props.column;
	        var field = this.getFilterField(props);
	        var buttons = this.getFilterButtons({
	            column: column
	        });

	        var children = [field, buttons].map(function (x, index) {
	            return React.createElement(
	                ReactMenu.Item,
	                { key: index },
	                React.createElement(
	                    ReactMenu.Item.Cell,
	                    null,
	                    x
	                )
	            );
	        });

	        props.itemOverStyle = props.itemOverStyle || overStyle;
	        props.itemActiveStyle = props.itemActiveStyle || overStyle;
	        props.onClick = props.onClick || stopPropagation;

	        var factory = this.props.filterMenuFactory;
	        var result;

	        if (factory) {
	            result = factory(props);

	            if (result !== undefined) {
	                return result;
	            }
	        }

	        props.onMount = this.onFilterMenuMount;

	        return React.createElement(
	            ReactMenu,
	            props,
	            children
	        );
	    },

	    onFilterMenuMount: function onFilterMenuMount(menu) {
	        var dom = menu.getDOMNode();

	        if (dom) {
	            var input = dom.querySelector('input');

	            if (input) {
	                setTimeout(function () {
	                    input.focus();
	                }, 10);
	            }
	        }
	    }
	};

/***/ },
/* 149 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(global) {'use strict';

	if (!global.fetch && global.window) {
	    __webpack_require__(150);
	}

	var fetch = global.fetch;

	module.exports = function () {
	    return {
	        fetch: fetch,
	        defaultPageSize: 20,
	        defaultPage: 1,

	        appendDataSourceQueryParams: true,
	        pagination: null,
	        // virtualPagination: false,

	        loading: null,
	        showLoadMask: true,
	        columnMinWidth: 50,
	        cellPadding: '0px 5px',
	        headerPadding: '10px 5px',
	        filterIconColor: '#6EB8F1',
	        menuIconColor: '#6EB8F1',
	        scrollbarSize: 20,

	        scrollBy: undefined,
	        virtualRendering: true,

	        styleAlternateRowsCls: 'z-style-alternate',
	        withColumnMenuCls: 'z-with-column-menu',
	        cellEllipsisCls: 'z-cell-ellipsis',
	        defaultClassName: 'react-datagrid',

	        withColumnMenu: true,
	        sortable: true,

	        filterable: null,
	        resizableColumns: null,
	        reorderColumns: null,

	        emptyCls: 'z-empty',
	        emptyTextStyle: null,
	        emptyWrapperStyle: null,

	        loadMaskOverHeader: true,

	        showCellBordersCls: 'z-cell-borders',
	        showCellBorders: false,
	        styleAlternateRows: true,
	        cellEllipsis: true,
	        rowHeight: 31,

	        groupNestingWidth: 20,

	        defaultStyle: {
	            position: 'relative'
	        }
	    };
	};
	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ },
/* 150 */
/***/ function(module, exports) {

	(function() {
	  'use strict';

	  if (self.fetch) {
	    return
	  }

	  function Headers(headers) {
	    this.map = {}

	    var self = this
	    if (headers instanceof Headers) {
	      headers.forEach(function(name, values) {
	        values.forEach(function(value) {
	          self.append(name, value)
	        })
	      })

	    } else if (headers) {
	      Object.getOwnPropertyNames(headers).forEach(function(name) {
	        self.append(name, headers[name])
	      })
	    }
	  }

	  Headers.prototype.append = function(name, value) {
	    name = name.toLowerCase()
	    var list = this.map[name]
	    if (!list) {
	      list = []
	      this.map[name] = list
	    }
	    list.push(value)
	  }

	  Headers.prototype['delete'] = function(name) {
	    delete this.map[name.toLowerCase()]
	  }

	  Headers.prototype.get = function(name) {
	    var values = this.map[name.toLowerCase()]
	    return values ? values[0] : null
	  }

	  Headers.prototype.getAll = function(name) {
	    return this.map[name.toLowerCase()] || []
	  }

	  Headers.prototype.has = function(name) {
	    return this.map.hasOwnProperty(name.toLowerCase())
	  }

	  Headers.prototype.set = function(name, value) {
	    this.map[name.toLowerCase()] = [value]
	  }

	  // Instead of iterable for now.
	  Headers.prototype.forEach = function(callback) {
	    var self = this
	    Object.getOwnPropertyNames(this.map).forEach(function(name) {
	      callback(name, self.map[name])
	    })
	  }

	  function consumed(body) {
	    if (body.bodyUsed) {
	      return Promise.reject(new TypeError('Already read'))
	    }
	    body.bodyUsed = true
	  }

	  function fileReaderReady(reader) {
	    return new Promise(function(resolve, reject) {
	      reader.onload = function() {
	        resolve(reader.result)
	      }
	      reader.onerror = function() {
	        reject(reader.error)
	      }
	    })
	  }

	  function readBlobAsArrayBuffer(blob) {
	    var reader = new FileReader()
	    reader.readAsArrayBuffer(blob)
	    return fileReaderReady(reader)
	  }

	  function readBlobAsText(blob) {
	    var reader = new FileReader()
	    reader.readAsText(blob)
	    return fileReaderReady(reader)
	  }

	  var support = {
	    blob: 'FileReader' in self && 'Blob' in self && (function() {
	      try {
	        new Blob();
	        return true
	      } catch(e) {
	        return false
	      }
	    })(),
	    formData: 'FormData' in self
	  }

	  function Body() {
	    this.bodyUsed = false

	    if (support.blob) {
	      this._initBody = function(body) {
	        this._bodyInit = body
	        if (typeof body === 'string') {
	          this._bodyText = body
	        } else if (support.blob && Blob.prototype.isPrototypeOf(body)) {
	          this._bodyBlob = body
	        } else if (support.formData && FormData.prototype.isPrototypeOf(body)) {
	          this._bodyFormData = body
	        } else if (!body) {
	          this._bodyText = ''
	        } else {
	          throw new Error('unsupported BodyInit type')
	        }
	      }

	      this.blob = function() {
	        var rejected = consumed(this)
	        if (rejected) {
	          return rejected
	        }

	        if (this._bodyBlob) {
	          return Promise.resolve(this._bodyBlob)
	        } else if (this._bodyFormData) {
	          throw new Error('could not read FormData body as blob')
	        } else {
	          return Promise.resolve(new Blob([this._bodyText]))
	        }
	      }

	      this.arrayBuffer = function() {
	        return this.blob().then(readBlobAsArrayBuffer)
	      }

	      this.text = function() {
	        var rejected = consumed(this)
	        if (rejected) {
	          return rejected
	        }

	        if (this._bodyBlob) {
	          return readBlobAsText(this._bodyBlob)
	        } else if (this._bodyFormData) {
	          throw new Error('could not read FormData body as text')
	        } else {
	          return Promise.resolve(this._bodyText)
	        }
	      }
	    } else {
	      this._initBody = function(body) {
	        this._bodyInit = body
	        if (typeof body === 'string') {
	          this._bodyText = body
	        } else if (support.formData && FormData.prototype.isPrototypeOf(body)) {
	          this._bodyFormData = body
	        } else if (!body) {
	          this._bodyText = ''
	        } else {
	          throw new Error('unsupported BodyInit type')
	        }
	      }

	      this.text = function() {
	        var rejected = consumed(this)
	        return rejected ? rejected : Promise.resolve(this._bodyText)
	      }
	    }

	    if (support.formData) {
	      this.formData = function() {
	        return this.text().then(decode)
	      }
	    }

	    this.json = function() {
	      return this.text().then(JSON.parse)
	    }

	    return this
	  }

	  // HTTP methods whose capitalization should be normalized
	  var methods = ['DELETE', 'GET', 'HEAD', 'OPTIONS', 'POST', 'PUT']

	  function normalizeMethod(method) {
	    var upcased = method.toUpperCase()
	    return (methods.indexOf(upcased) > -1) ? upcased : method
	  }

	  function Request(url, options) {
	    options = options || {}
	    this.url = url

	    this.credentials = options.credentials || 'omit'
	    this.headers = new Headers(options.headers)
	    this.method = normalizeMethod(options.method || 'GET')
	    this.mode = options.mode || null
	    this.referrer = null

	    if ((this.method === 'GET' || this.method === 'HEAD') && options.body) {
	      throw new TypeError('Body not allowed for GET or HEAD requests')
	    }
	    this._initBody(options.body)
	  }

	  function decode(body) {
	    var form = new FormData()
	    body.trim().split('&').forEach(function(bytes) {
	      if (bytes) {
	        var split = bytes.split('=')
	        var name = split.shift().replace(/\+/g, ' ')
	        var value = split.join('=').replace(/\+/g, ' ')
	        form.append(decodeURIComponent(name), decodeURIComponent(value))
	      }
	    })
	    return form
	  }

	  function headers(xhr) {
	    var head = new Headers()
	    var pairs = xhr.getAllResponseHeaders().trim().split('\n')
	    pairs.forEach(function(header) {
	      var split = header.trim().split(':')
	      var key = split.shift().trim()
	      var value = split.join(':').trim()
	      head.append(key, value)
	    })
	    return head
	  }

	  Request.prototype.fetch = function() {
	    var self = this

	    return new Promise(function(resolve, reject) {
	      var xhr = new XMLHttpRequest()
	      if (self.credentials === 'cors') {
	        xhr.withCredentials = true;
	      }

	      function responseURL() {
	        if ('responseURL' in xhr) {
	          return xhr.responseURL
	        }

	        // Avoid security warnings on getResponseHeader when not allowed by CORS
	        if (/^X-Request-URL:/m.test(xhr.getAllResponseHeaders())) {
	          return xhr.getResponseHeader('X-Request-URL')
	        }

	        return;
	      }

	      xhr.onload = function() {
	        var status = (xhr.status === 1223) ? 204 : xhr.status
	        if (status < 100 || status > 599) {
	          reject(new TypeError('Network request failed'))
	          return
	        }
	        var options = {
	          status: status,
	          statusText: xhr.statusText,
	          headers: headers(xhr),
	          url: responseURL()
	        }
	        var body = 'response' in xhr ? xhr.response : xhr.responseText;
	        resolve(new Response(body, options))
	      }

	      xhr.onerror = function() {
	        reject(new TypeError('Network request failed'))
	      }

	      xhr.open(self.method, self.url, true)
	      if ('responseType' in xhr && support.blob) {
	        xhr.responseType = 'blob'
	      }

	      self.headers.forEach(function(name, values) {
	        values.forEach(function(value) {
	          xhr.setRequestHeader(name, value)
	        })
	      })

	      xhr.send(typeof self._bodyInit === 'undefined' ? null : self._bodyInit)
	    })
	  }

	  Body.call(Request.prototype)

	  function Response(bodyInit, options) {
	    if (!options) {
	      options = {}
	    }

	    this._initBody(bodyInit)
	    this.type = 'default'
	    this.url = null
	    this.status = options.status
	    this.statusText = options.statusText
	    this.headers = options.headers
	    this.url = options.url || ''
	  }

	  Body.call(Response.prototype)

	  self.Headers = Headers;
	  self.Request = Request;
	  self.Response = Response;

	  self.fetch = function (url, options) {
	    return new Request(url, options).fetch()
	  }
	  self.fetch.polyfill = true
	})();


/***/ }
/******/ ])
});
;