import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Mail, Phone, User } from "lucide-react";
import heroBg from "@/assets/hero-bg.jpg";
import headmaster from "@/assets/headmaster.jpg";
import staffFemale1 from "@/assets/staff-female1.jpg";
import staffMale1 from "@/assets/staff-male1.jpg";
import staffFemale2 from "@/assets/staff-female2.jpg";
import staffMale2 from "@/assets/staff-male2.jpg";

type Category = "all" | "admin" | "senior" | "teachers";

const staffMembers = [
  {
    name: "Mr. Nyabako",
    position: "Head Master",
    department: "Administration",
    subject: "Educational Leadership",
    category: "admin" as Category,
    image: headmaster,
    email: "principal@stmaryshs.edu",
    bio: "Mr. Nyabako has been the Head Master of St. Mary's High School since 2010. With over 25 years of experience in education, he has transformed the school into one of the top-performing institutions in the region.",
    education: "M.Ed in Educational Leadership, University of Zimbabwe",
    experience: "25+ years in educational administration",
  },
  {
    name: "Mr. Gocha",
    position: "Deputy Head",
    department: "Administration",
    subject: "Administration",
    category: "admin" as Category,
    image: staffMale1,
    email: "deputy@stmaryshs.edu",
    bio: "Mr. Gocha serves as the Deputy Head, overseeing daily operations and student affairs. He specializes in curriculum development and teacher training.",
    education: "M.Sc in Educational Management, Midlands State University",
    experience: "18 years in secondary education",
  },
  {
    name: "Mrs. Chiweshe",
    position: "Senior Teacher",
    department: "Sciences",
    subject: "Mathematics & Sciences",
    category: "senior" as Category,
    image: staffFemale1,
    email: "sciences@stmaryshs.edu",
    bio: "Mrs. Chiweshe leads our Science Department and has been instrumental in developing our STEM program. Her students consistently achieve top marks in national examinations.",
    education: "B.Sc Honors in Chemistry, University of Zimbabwe",
    experience: "15 years teaching experience",
  },
  {
    name: "Mrs. Moyo",
    position: "Senior Teacher",
    department: "Arts & Humanities",
    subject: "English Literature",
    category: "senior" as Category,
    image: staffFemale2,
    email: "english@stmaryshs.edu",
    bio: "Mrs. Moyo is a passionate educator who leads the English and Humanities department. She has organized numerous literary competitions and debates.",
    education: "B.A. in English, Great Zimbabwe University",
    experience: "12 years teaching experience",
  },
  {
    name: "Mr. Mutasa",
    position: "Teacher",
    department: "Sciences",
    subject: "Physics & Mathematics",
    category: "teachers" as Category,
    image: staffMale2,
    email: "physics@stmaryshs.edu",
    bio: "Mr. Mutasa brings extensive experience in physics education, preparing students for competitive science olympiads and university entry.",
    education: "B.Ed in Physics, University of Zimbabwe",
    experience: "20 years teaching experience",
  },
  {
    name: "Mrs. Ndlovu",
    position: "Teacher",
    department: "Commercial",
    subject: "Accounting & Commerce",
    category: "teachers" as Category,
    image: staffFemale1,
    email: "commerce@stmaryshs.edu",
    bio: "Mrs. Ndlovu heads the Commercial Sciences department and is known for producing top-performing students in Accounting and Business Studies.",
    education: "B.Com Honors, NUST",
    experience: "10 years teaching experience",
  },
];

const categories: { label: string; value: Category }[] = [
  { label: "All Faculty", value: "all" },
  { label: "Administration", value: "admin" },
  { label: "Senior Teachers", value: "senior" },
  { label: "Teaching Staff", value: "teachers" },
];

const Staff = () => {
  const [activeCategory, setActiveCategory] = useState<Category>("all");
  const [selectedStaff, setSelectedStaff] = useState<typeof staffMembers[0] | null>(null);

  const filtered = activeCategory === "all"
    ? staffMembers
    : staffMembers.filter((s) => s.category === activeCategory);

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero Banner */}
      <section className="relative pt-20">
        <div className="h-64 md:h-80 relative overflow-hidden">
          <img src={heroBg} alt="Campus" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-hero flex items-center justify-center">
            <div className="text-center">
              <h1 className="font-display text-4xl md:text-5xl font-bold text-primary-foreground mb-2">Our Staff</h1>
              <p className="font-body text-primary-foreground/70 text-lg">Meet Our Dedicated Faculty</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          {/* Filter Buttons */}
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {categories.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setActiveCategory(cat.value)}
                className={`px-5 py-2.5 rounded-xl font-body font-semibold transition-all duration-300 ${
                  activeCategory === cat.value
                    ? "bg-primary text-primary-foreground shadow-lg"
                    : "bg-card text-foreground border border-border hover:bg-muted"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Staff Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {filtered.map((member) => (
              <div
                key={member.name + member.position}
                className="bg-card rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover hover:-translate-y-2 transition-all duration-300 border border-border group"
              >
                {/* Badge */}
                <div className="relative">
                  {member.category === "admin" && (
                    <span className="absolute top-3 right-3 z-10 bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-xs font-body font-bold">
                      {member.position}
                    </span>
                  )}
                  <div className="h-64 overflow-hidden">
                    <img
                      src={member.image}
                      alt={member.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  </div>
                </div>

                <div className="p-6 text-center">
                  <h3 className="font-display text-xl font-bold text-foreground mb-1">{member.name}</h3>
                  <p className="font-body text-accent-foreground font-semibold text-sm mb-2">{member.position}</p>
                  <p className="font-body text-muted-foreground text-sm mb-4">{member.subject}</p>

                  <div className="flex justify-center gap-2">
                    <a
                      href={`mailto:${member.email}`}
                      className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-300"
                    >
                      <Mail className="w-4 h-4" />
                    </a>
                    <button
                      onClick={() => setSelectedStaff(member)}
                      className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-300"
                    >
                      <User className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Staff Modal */}
      {selectedStaff && (
        <div
          className="fixed inset-0 z-[100] bg-foreground/80 flex items-center justify-center p-4"
          onClick={() => setSelectedStaff(null)}
        >
          <div
            className="bg-card rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-8">
              <div className="flex items-start gap-6 mb-6 flex-col sm:flex-row">
                <img
                  src={selectedStaff.image}
                  alt={selectedStaff.name}
                  className="w-28 h-28 rounded-full object-cover border-4 border-muted"
                />
                <div>
                  <h3 className="font-display text-2xl font-bold text-foreground">{selectedStaff.name}</h3>
                  <p className="font-body text-accent-foreground font-semibold">{selectedStaff.position}</p>
                  <span className="inline-block bg-muted px-3 py-1 rounded-full text-sm font-body text-muted-foreground mt-2">
                    {selectedStaff.department}
                  </span>
                </div>
              </div>

              <p className="font-body text-muted-foreground mb-6 leading-relaxed">{selectedStaff.bio}</p>

              <div className="grid sm:grid-cols-2 gap-4 mb-6">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-primary text-sm">🎓</span>
                  </div>
                  <div>
                    <p className="font-body font-semibold text-foreground text-sm">Education</p>
                    <p className="font-body text-muted-foreground text-sm">{selectedStaff.education}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-primary text-sm">💼</span>
                  </div>
                  <div>
                    <p className="font-body font-semibold text-foreground text-sm">Experience</p>
                    <p className="font-body text-muted-foreground text-sm">{selectedStaff.experience}</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <a
                  href={`mailto:${selectedStaff.email}`}
                  className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg font-body font-semibold text-sm hover:opacity-90 transition-opacity"
                >
                  <Mail className="w-4 h-4" /> Email
                </a>
                <button
                  onClick={() => setSelectedStaff(null)}
                  className="flex items-center gap-2 bg-muted text-foreground px-4 py-2 rounded-lg font-body font-semibold text-sm hover:bg-border transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default Staff;
