import React, { Component, PropTypes } from 'react';
import connectContainer from 'redux-static';
import { configurationActions, importExportActions } from '../actions';
import RuleSettings from '../components/Configuration/RuleSettings';

export default connectContainer(class extends Component {
  static stateToProps = (state) => ({
    configuration: state.configuration,
    importExport: state.importExport
  });

  static actionsToProps = {
    ...configurationActions,
    ...importExportActions
  }

  static propTypes = {
    configuration: PropTypes.object.isRequired,
    fetchConfiguration: PropTypes.func.isRequired,
    saveConfiguration: PropTypes.func.isRequired,
    exportConfig: PropTypes.func.isRequired
  }

  componentWillMount() {
    this.props.fetchConfiguration();
    this.props.exportConfig();
  }

  render() {
    return (
      <RuleSettings
        configuration={this.props.configuration}
        saveConfiguration={this.props.saveConfiguration}
        importExport={this.props.importExport}
        importConfigPrepare={this.props.importConfigPrepare}
        importConfig={this.props.importConfig}
        closePreview={this.props.closePreview}
      />
    );
  }
});
