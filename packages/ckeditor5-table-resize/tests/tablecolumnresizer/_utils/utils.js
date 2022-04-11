/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import { global } from 'ckeditor5/src/utils';
import Rect from '@ckeditor/ckeditor5-utils/src/dom/rect';
import { Point } from '@ckeditor/ckeditor5-widget/tests/widgetresize/_utils/utils';
import TableColumnResizeEditing from '../../../src/tablecolumnresize/tablecolumnresizeediting';

export const tableColumnResizeMouseSimulator = {
	down( editor, domTarget, options ) {
		const preventDefault = options.preventDefault || sinon.spy().named( 'preventDefault' );
		const stop = options.stop || sinon.spy().named( 'stop' );

		const clientX = getColumnResizerRect( domTarget ).x;

		const eventInfo = { stop };

		const domEventData = {
			target: editor.editing.view.domConverter.domToView( domTarget ),
			domEvent: { clientX },
			preventDefault
		};
		this._getPlugin( editor )._onMouseDownHandler( eventInfo, domEventData );
	},

	move( editor, domTarget, vector ) {
		const eventInfo = {};

		const domEventData = {
			clientX: getColumnResizerRect( domTarget ).moveBy( vector.x, vector.y ).x
		};

		this._getPlugin( editor )._onMouseMoveHandler( eventInfo, domEventData );
	},

	up( editor ) {
		this._getPlugin( editor )._onMouseUpHandler();
	},

	resize( editor, view, columnIndex, vector, rowIndex, options ) {
		const domResizer = getDomResizer( view, columnIndex, rowIndex );

		this.down( editor, domResizer, options || {} );
		this.move( editor, domResizer, vector );
		this.up( editor );
	},

	_getPlugin( editor ) {
		return editor.plugins.get( TableColumnResizeEditing );
	}
};

const getWidth = domElement => parseFloat( global.window.getComputedStyle( domElement ).width );

export const getDomTable = view => view.domConverter.mapViewToDom( view.document.getRoot().getChild( 0 ) );

export function getDomTableRects( domTable ) {
	return domTable.getClientRects()[ 0 ];
}

export function getDomTableCellRects( view, columnIndex ) {
	return Array.from( getDomTable( view ).querySelectorAll( 'td' ) )[ columnIndex ].getClientRects()[ 0 ];
}

export function getColumnWidth( view, columnIndex ) {
	const domTable = getDomTable( view );

	return getWidth( Array.from( domTable.querySelectorAll( 'col' ) )[ columnIndex ] );
}

export function getViewColumnWidthsPx( view ) {
	const domTable = getDomTable( view );
	const widths = [];

	Array.from( domTable.querySelectorAll( 'col' ) ).forEach( col => {
		widths.push( getWidth( col ) );
	} );
	return widths;
}

export function getModelColumnWidthsPc( model ) {
	return model.document.getRoot().getChild( 0 ).getAttribute( 'columnWidths' ).replaceAll( '%', '' ).split( ',' );
}

export function getViewColumnWidthsPc( view ) {
	const viewColWidths = [];

	for ( const item of view.createRangeIn( view.document.getRoot() ) ) {
		if ( item.item.is( 'element', 'col' ) ) {
			viewColWidths.push( item.item.getStyle( 'width' ).replaceAll( '%', '' ) );
		}
	}

	return viewColWidths;
}

export function getDomResizer( view, columnIndex, rowIndex ) {
	const domTable = getDomTable( view );
	const rows = Array.from( domTable.querySelectorAll( 'tr' ) );
	const row = rows[ rowIndex ? rowIndex : 0 ];
	const domResizer = Array.from( row.querySelectorAll( '.table-column-resizer' ) )[ columnIndex ];

	return domResizer;
}

export function getColumnResizerRect( resizerElement ) {
	const cellRect = new Rect( resizerElement.parentElement );
	const resizerPosition = new Point( cellRect.right, cellRect.top + cellRect.height / 2 );

	return resizerPosition;
}
