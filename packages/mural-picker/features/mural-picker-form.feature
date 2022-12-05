Feature: mural picker form

  Background:
    Given a workspace W1 with { "name": "workspace1" }
    And a room R1 with { "name": "room1", "workspaceId": "${W1.id}" }
    And a mural M1 with { "title": "mural1", "roomId": "${R1.id}" }
    And a workspace W2 with { "name": "workspace2" }
    And a room R2 with { "name": "room2", "workspaceId": "${W2.id}" }
    And a mural M2 with { "title": "mural2", "roomId": "${R2.id}" }
    And a mural M3 with { "title": "mural3", "roomId": "${R2.id}" }
    And I visit the "mural picker form" route
    And the route has finished loading

    Scenario: mural picker is rendered
      Then [mural picker] is shown

    Scenario: selecting one workspace shows the correct mural selected
      Given I select "workspace1" in [workspace select]
      And I select "room1" in [room select]
      And I select "mural1" in [mural select]
      Then [mural select] select has "mural1" selected

    Scenario: selecting mutiple workspace shows the murals of newly selected workspace
      Given I select "workspace1" in [workspace select]
      And I select "room1" in [room select]
      And I select "mural1" in [mural select]
      When I select "workspace2" in [workspace select]
      And I select "room2" in [room select]
      And I select "mural2" in [mural select]
      And I select "mural3" in [mural select]
      Then [mural select] select has "mural3" selected
