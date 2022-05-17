Feature: MsTeams create mural from template

  Background:
    Given a workspace W with { "id": "workspace1", "name": "workspace1" }
    And a room R with { "name": "room1", "workspaceId": "${W.id}" }
    And a template T with { "workspaceId": "${W.id}" }

  Scenario: invalid permissions error is shown when the current session don't have 'templates:read' scope
    Given I'm logged in with claims { "scopes": [] }
    And I visit the "create mural from template" route
    Then [invalid permissions error] is shown

  Scenario: clicking on create mural button from legacy search templates command
    Given I'm logged in with claims { "scopes": ["templates:read"] }
    And search params are { "templateId": "${T.id}" }
    And I visit the "create mural from template" route
    When I select "workspace1" in [workspace select]
    And I select "room1" in [room select]
    And I click on [room select button]
    Then store the document for the mural with { "roomId": "${R.id}" } in M
    And the last executed deep link is "https://teams.microsoft.com/l/entity/dummy_app_id/dummy_entity_id?context=%7B%22subEntityId%22%3A%22%7B%5C%22muralId%5C%22%3A%5C%22${M.id}%5C%22%2C%5C%22origin%5C%22%3A%5C%22executeDeepLink%5C%22%2C%5C%22source%5C%22%3A%5C%22create-mural-from-template%5C%22%7D%22%7D&webUrl=https%3A%2F%2Fmurally.testing.rig%2Ft%2Fwid%2Fm%2Fwid%2Fmid"

  Scenario: clicking on create mural button creates the new mural from template
    Given I'm logged in with claims { "scopes": ["templates:read"] }
    And search params are { "templateId": "${T.id}", "workspaceId": "${W.id}", "type": "custom"}
    And I visit the "create mural from template" route
    When I select "workspace1" in [workspace select]
    And I select "room1" in [room select]
    And I click on [room select button]
    Then store the document for the mural with { "roomId": "${R.id}" } in M
    And the last executed deep link is "https://teams.microsoft.com/l/entity/dummy_app_id/dummy_entity_id?context=%7B%22subEntityId%22%3A%22%7B%5C%22muralId%5C%22%3A%5C%22${M.id}%5C%22%2C%5C%22origin%5C%22%3A%5C%22executeDeepLink%5C%22%2C%5C%22source%5C%22%3A%5C%22create-mural-from-template%5C%22%7D%22%7D&webUrl=https%3A%2F%2Fmurally.testing.rig%2Ft%2Fwid%2Fm%2Fwid%2Fmid"

  Scenario: when create mural in room is not allowed, an error is shown
    Given I'm logged in with claims { "scopes": ["templates:read"] }
    And search params are { "templateId": "${T.id}", "workspaceId": "${W.id}", "type": "custom"}
    And the POST TEMPLATES_MURALS api response is 403 status
    And I visit the "create mural from template" route
    When I select "workspace1" in [workspace select]
    And I select "room1" in [room select]
    And I click on [room select button]
    Then [room picker error] is shown

  Scenario: clicking on create mural button creates the new mural from template
    Given I'm logged in with claims { "scopes": ["templates:read"] }
    And search params are { "templateId": "${T.id}", "workspaceId": "${W.id}", "type": "default"}
    And I visit the "create mural from template" route
    When I select "workspace1" in [workspace select]
    And I select "room1" in [room select]
    And I click on [room select button]
    Then store the document for the mural with { "roomId": "${R.id}" } in M
    And the last executed deep link is "https://teams.microsoft.com/l/entity/dummy_app_id/dummy_entity_id?context=%7B%22subEntityId%22%3A%22%7B%5C%22muralId%5C%22%3A%5C%22${M.id}%5C%22%2C%5C%22origin%5C%22%3A%5C%22executeDeepLink%5C%22%2C%5C%22source%5C%22%3A%5C%22create-mural-from-template%5C%22%7D%22%7D&webUrl=https%3A%2F%2Fmurally.testing.rig%2Ft%2Fwid%2Fm%2Fwid%2Fmid"

  Scenario: when create mural in room is not allowed, an error is shown
    Given I'm logged in with claims { "scopes": ["templates:read"] }
    And search params are { "templateId": "${T.id}", "workspaceId": "${W.id}", "type": "default"}
    And the POST TEMPLATES_MURALS api response is 403 status
    And I visit the "create mural from template" route
    When I select "workspace1" in [workspace select]
    And I select "room1" in [room select]
    And I click on [room select button]
    Then [room picker error] is shown
