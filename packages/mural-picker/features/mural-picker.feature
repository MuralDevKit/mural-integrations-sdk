Feature: mural picker

  Background:
    # Workspace 1
    Given a workspace W1 with { "name": "workspace1" }
    And a room R1 with { "name": "room1", "workspaceId": "${W1.id}" }
    And a room R2 with { "name": "room2", "workspaceId": "${W1.id}" }
    And a mural M1 with { "title": "mural1", "roomId": "${R1.id}", "workspaceId": "${W1.id}" }
    And a mural M2 with { "title": "mural2", "roomId": "${R1.id}", "workspaceId": "${W1.id}" }
    And a mural M3 with { "title": "mural3", "roomId": "${R2.id}", "workspaceId": "${W1.id}" }
    # Workspace 2
    And a workspace W2 with { "name": "workspace2" }
    And a room R3 with { "name": "room3", "workspaceId": "${W2.id}" }
    And a mural M4 with { "title": "mural4", "roomId": "${R3.id}", "workspaceId": "${W2.id}" }
    # Opening mural picker modal
    And I visit the "mural picker" route
    And the route has finished loading

  Scenario: the picker is shown
    Then [mural picker] is shown

  Scenario: the first workspace is selected by default and murals are shown
    Then the [card title] at index 0 content is "${M1.title}"
    And the [card title] at index 1 content is "${M2.title}"

  Scenario: selecting a room show the murals of that room
    When I select "workspace1" in [workspace select]
    And I select "room2" in [room select]
    Then the [card title] at index 0 content is "${M3.title}"

  Scenario: selecting a workspace show the murals of that workspace
    When I select "workspace2" in [workspace select]
    And I select "room3" in [room select]
    Then the [card title] at index 0 content is "${M4.title}"

  Scenario: selecting a workspace loads multiple pages of rooms
    # Force loading multiple pages by setting a small page size
    Given route /api/public/v1/workspaces/${W2.id}/rooms has page size 2
    # Add more rooms to workspace 2
    And a room R10 with { "name": "room10", "workspaceId": "${W2.id}" }
    And a room R11 with { "name": "room11", "workspaceId": "${W2.id}" }
    And a room R12 with { "name": "room12", "workspaceId": "${W2.id}" }
    And a room R13 with { "name": "room13", "workspaceId": "${W2.id}" }
    When I select "workspace2" in [workspace select]
    Then [room select] has 5 options

  Scenario: searching for a room in a workspace returns the room
    Given mural picker delay "DEBOUNCE_SEARCH" is 0ms
    When I select "workspace1" in [workspace select]
    And typing "room2" on the [input room select]
    And I select "room2" in [room select]
    Then the [card title] at index 0 content is "${M3.title}"

  Scenario: loads multiple pages of workspaces
    # Force loading multiple pages by setting a small page size
    Given route /api/public/v1/workspaces has page size 2
    # Add more workspaces
    And a workspace W3 with { "name": "workspace3" }
    And a workspace W4 with { "name": "workspace4" }
    And a workspace W5 with { "name": "workspace5" }
    # Reopen the mural picker to reload the workspaces
    And the page rerenders
    Then [workspace select] has 5 options

  Scenario: selecting a workspace aborts in-flight requests
    Given a fake timer
    And route /api/public/v1/workspaces/${W1.id}/rooms has delay 5000 ms
    # Reopen the mural picker to reload the murals
    And the page rerenders
    # Select a different workspace
    When I select "workspace2" in [workspace select]
    And the fake timer advances 5000 ms
    And all fetch requests complete
    # The picker shows the murals in workspace2
    Then the [card title] at index 0 content is "${M4.title}"

  Scenario: selecting a room aborts in-flight requests
    Given a fake timer
    And route /api/public/v1/workspaces/${W1.id}/murals has delay 5000 ms
    # Add another room with a mural to workspace 2
    And a room R10 with { "name": "room10", "workspaceId": "${W2.id}" }
    And a mural M10 with { "title": "mural10", "roomId": "${R10.id}", "workspaceId": "${W2.id}" }
    # Reopen the mural picker to reload the murals
    And the page rerenders
    # Select a different workspace and a room
    When I select "workspace2" in [workspace select]
    And I select "room10" in [room select]
    And the fake timer advances 5000 ms
    And all fetch requests complete
    Then the [card title] at index 0 content is "${M10.title}"

  Scenario: Create new mural shouldn't show when create is disabled
    Given mural picker create is disabled
    And the page rerenders
    Then [mural picker control] is not shown
