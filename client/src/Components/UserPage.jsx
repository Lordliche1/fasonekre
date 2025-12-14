import React from "react";
import UserNavbar from "./UserNavbar";

import Dashboard from "./Dashboard";
import UserProfile from "./UserProfile";
import UpdateUserProfile from "./UpdateUserProfile";
import FileNewGrievance from "./FileNewGrievance";
import MyGrievance from "./MyGrievance";
import Footer from "./Footer";

export default function UserPage() {
  if (localStorage.getItem("token") == null) {
    window.location.href = "/userlogin"
  }
  const token = localStorage.getItem("token")

  const [isClicked, setIsClicked] = React.useState("1")
  function handleClick(val, vis) {
    setIsClicked(val)
    setVisible(vis)
  }
  const [visible, setVisible] = React.useState("profile")

  return (
    <div className={token == null ? "hidden" : ""}>
      <div className="User-Page bg-gray-50 min-h-screen relative">
        {/* Desktop Sidebar (hidden on mobile) */}
        <div className="navbar hidden md:block">
          <UserNavbar
            first=""
            second=""
            third=""
            button="logout"
            hidden={true}
            clicked={isClicked}
            handle={handleClick}
          />
        </div>

        {/* Mobile Navbar (hidden on desktop) */}
        <div className="navbar md:hidden">
          <UserNavbar
            first="HOME"
            second="GRIEVANCE"
            third="NEW"
            fourth="UPDATE PROFILE"
            hidden={true}
            handle={handleClick}
            clicked={isClicked}
          />
        </div>

        {/* Main Content Area */}
        <div className="User-page-content hidden md:flex flex-col md:ml-64 w-full p-8 min-h-screen">
          <Dashboard
            clicked={isClicked}
            visible={visible}
            handle={handleClick}
            first={"HOME"}
            second="MY GRIEVANCE"
            third="NEW GRIEVANCE"
            fourth="UPDATE PROFILE"
          />
          <div className="mt-8">
            <UserProfile
              visible={visible}
              uName={"Vishesh Vijayvargiya"}
              mail={"iit2021114@iiita.ac.in"}
              contact={"0123456789"}
              address={"PLOT NO-2,EAST VINOD NAGAR, DELHI"}
            />
            <FileNewGrievance visible={visible} />
            <MyGrievance visible={visible} />
            <UpdateUserProfile visible={visible} />
          </div>
        </div>

        {/* Mobile Content Area */}
        <div className="User-page-content md:hidden relative p-4 min-h-screen">
          <UserProfile
            visible={visible}
            uName={"Vishesh Vijayvargiya"}
            mail={"iit2021114@iiita.ac.in"}
            contact={"0123456789"}
            address={"PlotNo.-2,East Vinod Nagar,Delhi"}
          />
          <FileNewGrievance visible={visible} />
          <MyGrievance visible={visible} />
          <UpdateUserProfile visible={visible} />
        </div>

        {/* Footer */}
        <div className="md:ml-64">
          <Footer className="z-10" />
        </div>
      </div>
    </div>
  );
}