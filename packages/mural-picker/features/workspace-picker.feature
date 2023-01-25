Feature: workspace picker

  Background:
    # Workspace 1
    Given a workspace W1 with { "name": "workspace1" }
    # Workspace 2
    And a workspace W2 with { "name": "workspace2" }
    # Open workspace picker
    And I visit the "workspace picker" route
    And the route has finished loading

  Scenario: the workspace picker is shown
    Then [workspace picker] is shown

  Scenario: the first workspace is selected by default
    When I click on [workspace select button]
    Then the last selected workspace is ${W1}

  Scenario: change the selected workspace
    When I select "workspace2" in [workspace select]
    And I click on [workspace select button]
    Then the last selected workspace is ${W2}

  Scenario: loads multiple pages of workspaces
    # Force loading multiple pages by setting a small page size
    Given route /api/public/v1/workspaces has page size 2
    # Add more workspaces
    And a workspace W3 with { "name": "workspace3" }
    And a workspace W4 with { "name": "workspace4" }
    And a workspace W5 with { "name": "workspace5" }
    # Reopen the workspace picker to reload the workspaces
    And the page rerenders
    Then [workspace select] has 5 options
