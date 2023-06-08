Feature: mural picker

  Scenario: Create new mural button should be disabled if can't load initial rooms and workspaces (rooms required to create)
    Given I visit the "mural picker" route
    When the route has finished loading
    Then the GET WORKSPACES api response is 200 status with
    """
    {"value":[]}
    """
    And the GET WORKSPACES_ROOMS api response is 200 status with
    """
    {"value":[]}
    """
    And attribute "state" of element [create button] is "disabled"

  Rule: loads properly
    Background:
      # Workspace 1
      Given a workspace W1 with { "name": "workspace1" }
      And a room R1 with { "name": "room1", "workspaceId": "${W1.id}" }
      And a room R2 with { "name": "room2", "workspaceId": "${W1.id}" }
      And a mural M1 with { "title": "mural1", "roomId": ${R1.id}, "workspaceId": "${W1.id}" }
      And a mural M2 with { "title": "mural2", "roomId": ${R1.id}, "workspaceId": "${W1.id}" }
      And a mural M3 with { "title": "mural3", "roomId": ${R2.id}, "workspaceId": "${W1.id}", "updatedOn": 1682800459957 }
      # Workspace 2
      And a workspace W2 with { "name": "workspace2" }
      And a room R3 with { "name": "room3", "workspaceId": "${W2.id}" }
      And a room R4 with { "name": "room4", "workspaceId": "${W2.id}" }
      And a mural M4 with { "title": "mural4", "roomId": ${R3.id}, "workspaceId": "${W2.id}" }
      And a mural M5 with { "title": "mural5", "roomId": ${R4.id}, "workspaceId": "${W2.id}" }
      And a room R10 with { "name": "room10", "workspaceId": "${W2.id}" }
      And a room R11 with { "name": "room11", "workspaceId": "${W2.id}" }
      And a room R12 with { "name": "room12", "workspaceId": "${W2.id}" }
      And a room R13 with { "name": "room13", "workspaceId": "${W2.id}" }
      # Opening mural picker modal
      And I visit the "mural picker" route
      And the route has finished loading

    Scenario: the picker is shown
      Then [mural picker] is shown

    Scenario: Recent tab is selected by default, create button and murals are shown
      And [create button] is shown
      And the [default tab] at index 0 content is "Recent"
      Then the [card title] at index 0 content is "${M3.title}"


    Scenario: selecting a workspace shows proper rooms and murals
      # Add more rooms to workspace 2
      # All rooms is valid option
      When I click on [all tab]
      And [room select] has 3 options
      Then I select "workspace2" in [workspace select]
      And [room select] has 7 options
      Then I select "room4" in [room select]
      And the [card title] at index 0 content is "${M5.title}"

    Scenario: selecting a workspace shows the murals of that workspace
      When I click on [all tab]
      Then [workspace select] is shown
      And [room select] is shown
      Then the [card title] at index 0 content is "${M1.title}"
      And the [card title] at index 1 content is "${M2.title}"
      Then I select "workspace2" in [workspace select]
      And the [card title] at index 0 content is "${M4.title}"

    Scenario: loads multiple workspaces
      # Add more workspaces
      And a workspace W3 with { "name": "workspace3" }
      And a workspace W4 with { "name": "workspace4" }
      And a workspace W5 with { "name": "workspace5" }
      # Reopen the mural picker to reload the workspaces
      And the page rerenders
      When I click on [all tab]
      Then [workspace select] has 5 options

    Scenario: selecting a workspace aborts in-flight requests
      Given a fake timer
      And I click on [all tab]
      # trigger new request
      When I select "workspace2" in [workspace select]
      And route /api/public/v1/workspaces/${W2.id}/rooms has delay 5000 ms
      And the fake timer advances 5000 ms
      # Select a different workspace
      When I select "workspace1" in [workspace select]
      And all fetch requests complete
      # The picker shows the murals in workspace2
      Then the [card title] at index 0 content is "${M1.title}"

    Scenario: selecting a room aborts in-flight requests
      Given a fake timer
      # intital load
      And route /api/public/v1/workspaces/${W1.id}/murals has delay 5000 ms
      And the page rerenders
      # Add another room with a mural to workspace 2
      And a mural M10 with { "title": "mural10", "roomId": ${R10.id}, "workspaceId": "${W2.id}" }
      # Select a different workspace and a room
      And I click on [all tab]
      When I select "workspace2" in [workspace select]
      And the fake timer advances 5000 ms
      And all fetch requests complete
      And I select "room10" in [room select]
      Then the [card title] at index 0 content is "${M10.title}"

    Scenario: selecting a new tab aborts in-flight requests
      Given a fake timer
      And I click on [all tab]
      # trigger new request
      When I select "workspace2" in [workspace select]
      And route /api/public/v1/workspaces/${W2.id}/murals has delay 5000 ms
      # switch tab
      And I click on [default tab]
      And the fake timer advances 5000 ms
      And all fetch requests complete
      # The picker shows the murals in workspace2
      Then the [card title] at index 0 content is "${M3.title}"
