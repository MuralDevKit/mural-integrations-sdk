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

  Scenario: searching for a room in a workspace returns the room
    Given mural picker delay "DEBOUNCE_SEARCH" is 0ms
    When I select "workspace1" in [workspace select]
    And typing "room2" on the [input room select]
    And I select "room2" in [room select]
    Then the [card title] at index 0 content is "${M3.title}"
