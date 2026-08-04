@HDPD-1021

Feature: Only challenging the legal validity of the landlord's notice

Scenario: Download paper form
Given I am on the "What type of application do you want to make" page
When I select the "Only challenge the legal validity of a landlord notice proposing a new rent" option
And I click Continue
Then I am taken to challenging legal validation notice page
When the citizen selects download paper form
Then the citizen is taken to the paper application form

Scenario: View GOV.UK guidance
Given I am on the "What type of application do you want to make" page
When I select the "Only challenge the legal validity of a landlord notice proposing a new rent" option
And I click Continue
Then I am taken to challenging legal validation notice page
When the citizen selects the guidance on GOV.UK link
Then the citizen is taken to the GOV.UK guidance page