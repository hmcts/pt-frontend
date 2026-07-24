@HDPD-996 @createapplication
Feature: Verify links on "You need to use another form to apply" page

  Background:
    Given I have selected Housing association as my landlord

  @AC1
  Scenario: Verify online application form link
    When the citizen selects the online application form link
    Then the citizen is taken to the online application form

  @AC2
  Scenario: Verify downloading the paper form link
    When the citizen selects the downloading the paper form link
    Then the citizen is taken to the paper application form

  @AC3
  Scenario: Verify guidance on GOV.UK link
    When the citizen selects the guidance on GOV.UK link
    Then the citizen is taken to the GOV.UK guidance page
