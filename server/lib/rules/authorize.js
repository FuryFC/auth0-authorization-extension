module.exports = `/*
*  This rule been automatically generated by auth0-authz-extension
*  Updated by <%= userName %>, <%= updateTime() %>
 */
function (user, context, callback) {
  var _ = require('lodash');
  var EXTENSION_URL = "<%= extensionUrl %>";

  getPolicy(user, context, function(err, res, data) {
    if (err) {
      console.log('Error from Authorization Extension:', err);
      return callback(new UnauthorizedError('Authorization Extension: ' + err.message));
    }

    if (res.statusCode !== 200) {
      console.log('Error from Authorization Extension:', res.body || res.statusCode);
      return callback(
        new UnauthorizedError('Authorization Extension: ' + ((res.body && (res.body.message || res.body) || res.statusCode)))
      );
    }

    // Update the user object.<% if (config.groupsInToken && !config.groupsPassthrough) { %>
    user.groups = data.groups;<% } %><% if (config.groupsInToken && config.groupsPassthrough) { %>
    user.groups = mergeRecords(user.groups, data.groups);<% } %><% if (config.rolesInToken && !config.rolesPassthrough) { %>
    user.roles = data.roles;<% } %><% if (config.rolesInToken && config.rolesPassthrough) { %>
    user.roles = mergeRecords(user.roles, data.roles);<% } %><% if (config.permissionsInToken && !config.permissionsPassthrough) { %>
    user.permissions = data.permissions;<% } %><% if (config.permissionsInToken && config.permissionsPassthrough) { %>
    user.permissions = mergeRecords(user.permissions, data.permissions);<% } %>
<% if (config.persistGroups || config.persistRoles || config.persistPermissions) { %>
    // Store this in the user profile (app_metadata).
    saveToMetadata(user, data.groups, data.roles, data.permissions, function(err) {
      return callback(err, user, context);
    });
<% } else { %>
    return callback(null, user, context);
<% } %>  });

  // Get the policy for the user.
  function getPolicy(user, context, cb) {
    request.post({
      url: EXTENSION_URL + "/api/users/" + user.user_id + "/policy/" + context.clientID,
      headers: {
        "x-api-key": "<%= apiKey %>"
      },
      json: {
        connectionName: context.connection || user.identities[0].connection,
        groups: user.groups
      },
      timeout: 5000
    }, cb);
  }<% if (config.persistGroups || config.persistRoles || config.persistPermissions) { %>

  // Store authorization data in the user profile so we can query it later.
  function saveToMetadata(user, groups, roles, permissions, cb) {
    user.app_metadata = user.app_metadata || {};
    user.app_metadata.authorization = {<% if (config.persistGroups && !config.groupsPassthrough) { %>
      groups: groups,<% } %><% if (config.persistGroups && config.groupsPassthrough) { %>
      groups: mergeRecords(user.groups, groups),<% } %><% if (config.persistRoles && !config.rolesPassthrough) { %>
      roles: roles,<% } %><% if (config.persistRoles && config.rolesPassthrough) { %>
      roles: mergeRecords(user.roles, roles),<% } %><% if (config.persistPermissions && !config.permissionsPassthrough) { %>
      permissions: permissions<% } %><% if (config.persistPermissions && config.permissionsPassthrough) { %>
      permissions: mergeRecords(user.permissions, permissions)<% } %>
    };

    auth0.users.updateAppMetadata(user.user_id, user.app_metadata)
    .then(function() {
      cb();
    })
    .catch(function(err){
      cb(err);
    });
  }<% } %><% if (config.groupsPassthrough || config.rolesPassthrough || config.permissionsPassthrough) { %>

  // Merge the IdP records with the records of the extension.
  function mergeRecords(idpRecords, extensionRecords) {
    idpRecords = idpRecords || [ ];
    extensionRecords = extensionRecords || [ ];

    if (!Array.isArray(idpRecords)) {
      idpRecords = idpRecords.replace(/,/g, ' ').replace(/\\s+/g, ' ').split(' ');
    }

    return _.uniq(_.union(idpRecords, extensionRecords));
  }<% } %>
}`;
