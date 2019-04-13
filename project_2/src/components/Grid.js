import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Button, FormGroup, FormControl, ControlLabel,Grid,Row,Col } from 'react-bootstrap';
import '../resources/styles/Grid.css';
import {Animated} from "react-animated-css";
import ReactDataGrid from 'react-data-grid';

const RGrid = (props) => (
    <div className="rgrid">
    <ReactDataGrid
      columns={props.columnDefs}
      rowGetter={i => props.rowData[i]}
      rowsCount={props.rowData.length}
      maxHeight={250}
      onGridRowsUpdated={props.onGridRowsUpdated}
      getCellActions = {props.getCellActions}
      enableDragAndDrop
      rowHeight={25} />
    </div>
);

RGrid.propTypes = {
    text: PropTypes.string
};

export default RGrid;
