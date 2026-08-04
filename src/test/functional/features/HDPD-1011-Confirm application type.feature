@HDPD-1011

Feature: Confirm application type

Scenario: Open market rent determination application
Given I am on the "What type of application do you want to make" page
When I select the "Open market rent determination application" option
And  I click Continue
Then I am taken to the "Who is named on your tenancy" page

Scenario: Challenge legal validity of landlord notice
Given I am on the "What type of application do you want to make" page
When I select the "Only challenge the legal validity of a landlord notice proposing a new rent" option
And I click Continue
Then I am taken to challenging legal validation notice page


Scenario: No option selected
Given I am on the "What type of application do you want to make" page
When I click Continue
Then I can see error message is displayed