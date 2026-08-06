@JIRA-EPIC:HDPD-648
Feature: You need to use another form

  @AC1 @JIRA-TEST-KEY:PTSD-443
  Scenario: Citizen opens the online application form
    Given I select apply for some one else option and landed on the you need to use another form to apply page
    When the citizen selects the online application form link
    Then the citizen is taken to the online application form

  @AC2 @JIRA-TEST-KEY:PTSD-444
  Scenario: Citizen opens the paper application form
    Given I select apply for some one else option and landed on the you need to use another form to apply page
    When the citizen selects the downloading the paper form link
    Then the citizen is taken to the paper application form

  @AC3 @JIRA-TEST-KEY:PTSD-445
  Scenario: Citizen opens the GOV.UK guidance page
    Given I select apply for some one else option and landed on the you need to use another form to apply page
    When the citizen selects the guidance on GOV.UK link
    Then the citizen is taken to the GOV.UK guidance page
