@HDPD-648 @youneedtouseanotherform
Feature: You need to use another form

  @AC1
  Scenario: Citizen opens the online application form
    Given the citizen is on the you need to use another form to apply page
    When the citizen selects the online application form link
    Then the citizen is taken to the online application form

  @AC2
  Scenario: Citizen opens the paper application form
    Given the citizen is on the you need to use another form to apply page
    When the citizen selects the downloading the paper form link
    Then the citizen is taken to the paper application form

  @AC3
  Scenario: Citizen opens the GOV.UK guidance page
    Given the citizen is on the you need to use another form to apply page
    When the citizen selects the guidance on GOV.UK link
    Then the citizen is taken to the GOV.UK guidance page
