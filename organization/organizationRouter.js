const express = require("express");
const Organization = require("../organization/organizationModel.js");
const Team = require("../teams/teamModel.js")
const Invites = require("../invites/inviteModel.js");
const greek = require("../invites/greekalpha.json");

const router = express.Router();

//create an org
router.post("/", (req, res) => {
  const organ = req.body;
  console.log(req.user.id);

  Organization.insert(organ)
    .then((org) => {
      console.log("organiztion id", org);
      console.log("req user", req.user.id);
      Organization.insertOrgUser({
        organization_id: org[0],
        user_id: req.user.id,
        role_id: 3,
      })
        .then((count) => res.status(201).json({ id: org[0], name: organ.name }))
        .catch((err) =>
          res
            .status(500)
            .json({
              message: `couldn't insert user ${req.user.id} and organization ${org[0].id} to the org_users table`,
              error: err,
            })
        );
    })
    .catch((err) =>
      res
        .status(500)
        .json({ message: "Sorry organization can't be created", error: err })
    );
});

//Add a member to an org
router.post("/:id/members", (req, res) => {
  const { id } = req.params;
  const body = { ...req.body, organization_id: id };

  if (body.organization_id && body.user_id && body.role_id) {
    Organization.insertOrgUser(body)
      .then((count) => res.status(201).json(body))
      .catch((err) =>
        res.status(500).json({ message: "Cannot add new member.", error: err })
      );
  } else {
    res
      .status(500)
      .json({ message: `Must have organization_id, user_id, and role_id` });
  }
});

router.get("/:id/teams", (req, res) => {
  Organization.getTeamsByOrganization(req.params.id)
    .then((teams) => res.status(200).json(teams))
    .catch((err) =>
      res.status(500).json({ message: "Cannot get teams", error: err })
    );
});


router.get("/:id/users", (req, res) => {
    Organization.getUsersByOrganization(req.params.id)
      .then((users) => res.status(200).json(users))
      .catch((err) =>
        res.status(500).json({ message: "Cannot get users", error: err })
      );
  });
  

  router.delete("/:id/users", (req, res) => {
      const {id} = req.params
      const {user_id} = req.body
   
      Team.removeFromAllTeams(user_id)
      .then(() => {
        
        Organization.deleteOrganizationMember(id, user_id)
        .then((user) => res.status(200).json({message: 'deleted user from organization', user}))
        .catch((err) =>
        
        res.status(500).json({ message: "Cannot delete user from Organizaiton", error: err })
        
      );
      })
      .catch((err) =>
      res.status(500).json({ message: "Cannot delete user from teams", error: err })
    );
      
  })

module.exports = router;
