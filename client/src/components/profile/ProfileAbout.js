import React, { Fragment } from "react";
import PropTypes from "prop-types";

const ProfileAbout = ({
  profile: {
    bio,
    skills,
    user: { name },
  },
}) => {
  const firstName = name.trim().split(" ")[0];
  return (
    <div class="profile-about bg-light p-2">
      {bio && (
        <Fragment>
          <h2 class="text-primary">
            {firstName}
            {firstName.slice(-1) === "s" ? "'" : "'s"} Bio
          </h2>
          <p>{bio}</p>
          <div class="line"></div>
        </Fragment>
      )}

      <h2 class="text-primary">Skill Set</h2>
      <div class="skills">
        {skills.map((lead, index) => (
          <div key={index} className="p-1">
            <i className="fas fa-check"></i> {lead}
          </div>
        ))}
      </div>
    </div>
  );
};

ProfileAbout.propTypes = {
  profile: PropTypes.object.isRequired,
};

export default ProfileAbout;
