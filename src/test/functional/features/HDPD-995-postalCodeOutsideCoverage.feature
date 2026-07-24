@HDPD-995 @createapplication
Feature: Verify online application form ,download the paper and gov.uk link after entering postal code

  Background:
    Given I am on the postcode outside coverage page

  @AC1
  Scenario: User select online application form
     When the citizen selects the online application form link
    Then the citizen is taken to the online application form

  @AC2
  Scenario: User select downloading the paper form
  When the citizen selects the downloading the paper form link
    Then the citizen is taken to the paper application form
  @AC3
  Scenario: User select guidance on GOV.UK
    When the citizen selects the guidance on GOV.UK link
    Then the citizen is taken to the GOV.UK guidance page

