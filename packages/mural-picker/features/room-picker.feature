Feature: room picker

  Background:
    # Workspace 1
    Given a workspace W1 with { "name": "workspace1" }
    And a room R1 with { "name": "room1", "workspaceId": "${W1.id}" }
    And a room R2 with { "name": "room2", "workspaceId": "${W1.id}" }
    # Workspace 2
    And a workspace W2 with { "name": "workspace2" }
    And a room R3 with { "name": "room3", "workspaceId": "${W2.id}" }
    And a room R4 with { "name": "room4", "workspaceId": "${W2.id}" }
    # Open room picker
    And I visit the "room picker" route
    And the route has finished loading

  Scenario: the room picker is shown
    Then [room picker] is shown

  Scenario: select a workspace and a room
    When I select "workspace2" in [workspace select]
    And I select "room3" in [room select]
    And I click on [room select button]
    Then the last selected workspace is ${W2}
    And the last selected room is ${R3}

  Scenario: loads multiple pages of workspaces
    # Force loading multiple pages by setting a small page size
    Given route /api/public/v1/workspaces has page size 2
    # Add more workspaces
    And a workspace W3 with { "name": "workspace3" }
    And a workspace W4 with { "name": "workspace4" }
    And a workspace W5 with { "name": "workspace5" }
    # Reopen the room picker to reload the workspaces
    And the page rerenders
    Then [workspace select] has 5 options
